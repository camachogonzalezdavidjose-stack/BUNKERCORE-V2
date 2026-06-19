const { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} = require('@simplewebauthn/server');
const { isoBase64URL } = require('@simplewebauthn/server/helpers');
const UserModel = require('../models/user');
const CredentialModel = require('../models/credential');
const challengeStore = require('../utils/challengeStore');

// Configuración dinámica para soportar local dev y producción
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || `http://localhost:${process.env.FRONTEND_PORT || 5173}`;

console.log(`[WebAuthn] Configured with RP_ID: ${RP_ID} and ORIGIN: ${ORIGIN}`);

const generateRegistrationOptionsHandler = async (req, res) => {
  try {
    const { email, username } = req.body;
    const identifier = email || username;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or username is required' });
    }
    let user = await UserModel.findByEmail(identifier);
    if (!user) {
      user = await UserModel.create(identifier);
    }

    const options = await generateRegistrationOptions({
      rpName: 'BunkerCore',
      rpID: RP_ID,
      userID: Buffer.from(user.id.toString()),
      userName: user.email || identifier,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    challengeStore.set(identifier, options.challenge);
    res.json(options);
  } catch (e) {
    console.error('Error generating registration options:', e);
    res.status(500).json({ error: e.message });
  }
};

const verifyRegistrationHandler = async (req, res) => {
  try {
    const { email, username, attestation } = req.body;
    const identifier = email || username;
    const user = await UserModel.findByEmail(identifier);
    const storedChallenge = challengeStore.get(identifier);

    if (!storedChallenge || !storedChallenge.challenge) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    const verification = await verifyRegistrationResponse({
      response: attestation,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified) {
      const { registrationInfo } = verification;
      
      // Convertimos los Uint8Array a base64url para guardarlos en la BD (TEXT)
      const credentialId = isoBase64URL.fromBuffer(registrationInfo.credentialID);
      const publicKey = isoBase64URL.fromBuffer(registrationInfo.credentialPublicKey);

      await CredentialModel.create({
        userId: user.id,
        credentialId: credentialId,
        publicKey: publicKey,
        counter: registrationInfo.counter,
        aaguid: registrationInfo.aaguid,
      });
      
      challengeStore.delete(identifier); // Limpiar challenge usado
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Verification failed' });
    }
  } catch (e) {
    console.error('Error verifying registration:', e);
    res.status(500).json({ error: e.message });
  }
};

const generateAuthenticationOptionsHandler = async (req, res) => {
  try {
    const { email, username } = req.body;
    const identifier = email || username;
    const user = await UserModel.findByEmail(identifier);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const credentials = await CredentialModel.findByUserId(user.id);
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: credentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
      })),
      userVerification: 'preferred',
    });

    challengeStore.set(identifier, options.challenge);
    res.json(options);
  } catch (e) {
    console.error('Error generating authentication options:', e);
    res.status(500).json({ error: e.message });
  }
};

const verifyAuthenticationHandler = async (req, res) => {
  try {
    const { email, username, assertion } = req.body;
    const identifier = email || username;
    const user = await UserModel.findByEmail(identifier);
    const storedChallenge = challengeStore.get(identifier);
    
    if (!storedChallenge || !storedChallenge.challenge) {
        return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    const dbCredential = await CredentialModel.findById(assertion.id);
    if (!dbCredential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: isoBase64URL.toBuffer(dbCredential.credential_id),
        credentialPublicKey: isoBase64URL.toBuffer(dbCredential.public_key),
        counter: parseInt(dbCredential.counter || 0),
      },
    });

    if (verification.verified) {
      await CredentialModel.updateCounter(assertion.id, verification.authenticationInfo.newCounter);
      challengeStore.delete(identifier); // Limpiar challenge usado
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Authentication failed' });
    }
  } catch (e) {
    console.error('Error verifying authentication:', e);
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  generateRegistrationOptions: generateRegistrationOptionsHandler,
  verifyRegistration: verifyRegistrationHandler,
  generateAuthenticationOptions: generateAuthenticationOptionsHandler,
  verifyAuthentication: verifyAuthenticationHandler,
};
