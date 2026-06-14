const { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} = require('@simplewebauthn/server');
const UserModel = require('../models/user');
const CredentialModel = require('../models/credential');
const challengeStore = require('../utils/challengeStore');

const RP_ID = 'localhost';
const RP_NAME = 'BunkerCore';
const ORIGIN = 'http://localhost:5173';

const generateOptions = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[WebAuthn] Generating registration options for:', email);
    
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await UserModel.findByEmail(email);
    if (!user) {
      console.log('[WebAuthn] User not found, creating new user:', email);
      user = await UserModel.create(email);
    }

    const userCredentials = await CredentialModel.findByUserId(user.id);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.email,
      userDisplayName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      excludeCredentials: userCredentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
      })),
    });

    challengeStore.set(email, options.challenge);
    console.log('[WebAuthn] Registration options sent to client');
    res.json(options);
  } catch (error) {
    console.error('[WebAuthn Error] generateOptions:', error);
    res.status(500).json({ error: error.message });
  }
};

const verifyRegistration = async (req, res) => {
  try {
    const { email, attestation } = req.body;
    console.log('[WebAuthn] Verifying registration for:', email);

    const storedChallenge = challengeStore.get(email);
    if (!storedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const verification = await verifyRegistrationResponse({
      response: attestation,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification;
      const user = await UserModel.findByEmail(email);
      
      if (!user) throw new Error('User not found during verification');

      const credentialID = registrationInfo.credential.id;
      const credentialPublicKey = registrationInfo.credential.publicKey;
      const counter = registrationInfo.credential.counter;
      const aaguid = registrationInfo.aaguid;

      await CredentialModel.create({
        userId: user.id,
        credentialId: credentialID, 
        publicKey: Buffer.from(Object.values(credentialPublicKey)).toString('base64url'),
        counter: counter,
        aaguid: aaguid,
      });

      challengeStore.delete(email);
      console.log('[WebAuthn] Registration successful for:', email);
      res.json({ verified: true });
    } else {
      console.warn('[WebAuthn] Registration verification failed for:', email);
      res.status(400).json({ verified: false, error: 'Verification failed' });
    }
  } catch (error) {
    console.error('[WebAuthn Error] verifyRegistration:', error);
    res.status(400).json({ error: error.message });
  }
};

const generateAuthOptions = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[WebAuthn] Generating auth options for:', email);

    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const credentials = await CredentialModel.findByUserId(user.id);

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: credentials.map(cred => ({
        id: cred.credential_id,
        type: 'public-key',
      })),
      userVerification: 'preferred',
    });

    challengeStore.set(email, options.challenge);
    res.json(options);
  } catch (error) {
    console.error('[WebAuthn Error] generateAuthOptions:', error);
    res.status(500).json({ error: error.message });
  }
};

const verifyAuthentication = async (req, res) => {
  try {
    const { email, assertion } = req.body;
    console.log('[WebAuthn] Verifying authentication for:', email);

    const storedChallenge = challengeStore.get(email);
    if (!storedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    const dbCredential = await CredentialModel.findById(assertion.id);
    if (!dbCredential) return res.status(404).json({ error: 'Credential not found' });

    const verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: dbCredential.credential_id,
        credentialPublicKey: new Uint8Array(Buffer.from(dbCredential.public_key, 'base64url')),
        counter: parseInt(dbCredential.counter),
      },
    });

    if (verification.verified) {
      await CredentialModel.updateCounter(assertion.id, verification.authenticationInfo.newCounter);
      challengeStore.delete(email);
      console.log('[WebAuthn] Authentication successful for:', email);
      res.json({ verified: true });
    } else {
      console.warn('[WebAuthn] Authentication failed for:', email);
      res.status(400).json({ verified: false, error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('[WebAuthn Error] verifyAuthentication:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { 
  generateOptions, 
  verifyRegistration, 
  generateAuthOptions, 
  verifyAuthentication 
};
