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

// In-Memory Database for Passkeys
const users: Record<string, any> = {};
const authenticators: Record<string, any[]> = {};
const currentChallenges: Record<string, string> = {};

const rpName = "Bunkercore Identity Provider";

// Forzado a 5173 directo en el core
const appUrl = process.env.APP_URL || "http://localhost:5173";
const origin = appUrl;
const rpID = new URL(appUrl).hostname;

async function startServer() {
  const app = express();
  const PORT = 5173; 

  app.use(express.json());

  // === WEB AUTHN IDENTIY PROVIDER (IdP) ROUTES ===

  app.post("/api/webauthn/register/generate", async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    if (!users[username]) {
      users[username] = { id: crypto.randomUUID(), username };
    }
    const user = users[username];
    const userAuthenticators = authenticators[username] || [];

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.username,
      excludeCredentials: userAuthenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
        transports: auth.transports,
      })),
      authenticatorSelection: { userVerification: 'preferred' },
    });

    currentChallenges[username] = options.challenge;
    res.json(options);
  });

  app.post("/api/webauthn/register/verify", async (req, res) => {
    const { username, response } = req.body;
    const expectedChallenge = currentChallenges[username];

    if (!expectedChallenge) {
      return res.status(400).json({ error: "No active challenge found." });
    }

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

        if (!authenticators[username]) authenticators[username] = [];

        authenticators[username].push({
          credentialID: credential.id,
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
          transports: response.response.transports,
          credentialDeviceType,
          credentialBackedUp,
        });
        delete currentChallenges[username];

        return res.json({ verified: true, message: "Token cryptográfico registrado en Enclave V." });
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/webauthn/auth/generate", async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username required" });

    const userAuthenticators = authenticators[username] || [];
    if (!userAuthenticators.length) {
      return res.status(400).json({ error: "User is not registered with FIDO2." });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userAuthenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
        transports: auth.transports,
      })),
      userVerification: 'preferred',
    });

    currentChallenges[username] = options.challenge;
    res.json(options);
  });

  app.post("/api/webauthn/auth/verify", async (req, res) => {
    const { username, response } = req.body;
    const expectedChallenge = currentChallenges[username];
    const userAuthenticators = authenticators[username] || [];

    if (!expectedChallenge) return res.status(400).json({ error: "No active challenge found." });

    const authenticator = userAuthenticators.find(auth => auth.credentialID === response.id);
    if (!authenticator) return res.status(400).json({ error: "Authenticator not found." });

    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: [origin, 'https://localhost:5173', 'https://0.0.0.0:5173', 'http://localhost:5173'],
        expectedRPID: rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: authenticator.credentialPublicKey,
          counter: authenticator.counter,
          transports: authenticator.transports,
        }
      });

      if (verification.verified) {
        authenticator.counter = verification.authenticationInfo.newCounter;
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server FIDO2 Gateway running on port ${PORT}`);
  });
}

startServer();
