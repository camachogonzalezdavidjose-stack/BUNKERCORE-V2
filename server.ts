import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import { verifyRecaptcha } from "./middleware/recaptcha"; // <--- Escudo importado

// Conexión directa a Neon usando la variable de entorno
const sql = neon(process.env.DATABASE_URL!);

const currentChallenges: Record<string, string> = {};
const rpName = "Bunkercore Identity Provider";
const appUrl = process.env.APP_URL || "http://localhost:5173";
const origin = appUrl;
const rpID = new URL(appUrl).hostname;

async function startServer() {
  const app = express();
  const PORT = 5173;

  app.use(express.json());

  // === WEB AUTHN IDENTIY PROVIDER (IdP) ROUTES WITH NEON DB ===

  // 1. Generate Registration -> ¡BLINDADO CON RECAPTCHA CON EXITO!
  app.post("/api/webauthn/register/generate", verifyRecaptcha, async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    // Buscar si el usuario ya existe en Neon, si no, lo creamos de forma lógica
    const existingUser = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
    let userID;
    if (existingUser.length === 0) {
      userID = crypto.randomUUID();
      await sql`INSERT INTO users (id, username) VALUES (${userID}, ${username})`;
    } else {
      userID = existingUser[0].id;
    }

    // Obtener credenciales existentes para excluirlas
    const userAuthenticators = await sql`SELECT credential_id FROM webauthn_credentials WHERE username = ${username}`;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(userID)),
      userName: username,
      excludeCredentials: userAuthenticators.map(auth => ({
        id: auth.credential_id,
        type: 'public-key',
      })),
      authenticatorSelection: { userVerification: 'preferred' },
    });

    currentChallenges[username] = options.challenge;
    res.json(options);
  });

  // 2. Verify Registration -> ¡AQUÍ SE GUARDA EN NEON!
  app.post("/api/webauthn/register/verify", async (req, res) => {
    const { username, response } = req.body;
    const expectedChallenge = currentChallenges[username];

    if (!expectedChallenge) return res.status(400).json({ error: "No active challenge found." });

    try {
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: [origin, 'https://localhost:5173', 'https://0.0.0.0:5173', 'http://localhost:5173'],
        expectedRPID: rpID,
        requireUserVerification: true,
      });

      if (verification.verified && verification.registrationInfo) {
        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

        // INSERT REAL EN NEON DB
        await sql`
          INSERT INTO webauthn_credentials (credential_id, username, public_key, counter, device_type, backed_up)
          VALUES (${credential.id}, ${username}, ${Buffer.from(credential.publicKey).toString('base64')}, ${credential.counter}, ${credentialDeviceType}, ${credentialBackedUp})
        `;

        delete currentChallenges[username];
        return res.json({ verified: true, message: "Token cryptográfico registrado en Neon DB con éxito." });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: (error as Error).message });
    }
  });

  // 3. Generate Authentication -> TAMBIÉN PROTEGIDO POR SEGURIDAD
  app.post("/api/webauthn/auth/generate", verifyRecaptcha, async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    const userAuthenticators = await sql`SELECT credential_id FROM webauthn_credentials WHERE username = ${username}`;
    if (!userAuthenticators.length) return res.status(400).json({ error: "User is not registered with FIDO2." });

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userAuthenticators.map(auth => ({
        id: auth.credential_id,
        type: 'public-key',
      })),
      userVerification: 'preferred',
    });

    currentChallenges[username] = options.challenge;
    res.json(options);
  });

  // 4. Verify Authentication
  app.post("/api/webauthn/auth/verify", async (req, res) => {
    const { username, response } = req.body;
    const expectedChallenge = currentChallenges[username];

    if (!expectedChallenge) return res.status(400).json({ error: "No active challenge found." });

    const auths = await sql`SELECT * FROM webauthn_credentials WHERE credential_id = ${response.id} AND username = ${username} LIMIT 1`;
    if (!auths.length) return res.status(400).json({ error: "Authenticator not found." });
    const authenticator = auths[0];

    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: [origin, 'https://localhost:5173', 'https://0.0.0.0:5173', 'http://localhost:5173'],
        expectedRPID: rpID,
        credential: {
          id: authenticator.credential_id,
          publicKey: Buffer.from(authenticator.public_key, 'base64'),
          counter: parseInt(authenticator.counter),
        }
      });

      if (verification.verified) {
        // Actualizar contador en Neon
        await sql`UPDATE webauthn_credentials SET counter = ${verification.authenticationInfo.newCounter} WHERE credential_id = ${authenticator.credential_id}`;
        delete currentChallenges[username];
        return res.json({ verified: true, message: "Validación Asimétrica Completada." });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: (error as Error).message });
    }
  });

  // === VITE MIDDLEWARE ===
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server FIDO2 Gateway running on port ${PORT}`);
  });
}

startServer();
