const { 
    generateRegistrationOptions, 
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse 
} = require('@simplewebauthn/server');
const ChallengeStore = require('../utils/challengeStore');
const CredentialModel = require('../models/credential');

const rpName = 'BunkerCore-V2';
const rpID = 'davidauthn.online'; // Actualizado a tu dominio
const origin = 'https://davidauthn.online';

const WebAuthnController = {
    async generateOptions(req, res) {
        const { userId, email } = req.body;
        const userIDBuffer = Uint8Array.from(userId, c => c.charCodeAt(0));
        const options = await generateRegistrationOptions({
            rpName, rpID, userID: userIDBuffer, userName: email, attestationType: 'none',
            userVerification: 'required',
        });
        ChallengeStore.set(userId, options.challenge);
        res.json(options);
    },

    async verifyRegistration(req, res) {
        const { userId, body } = req.body;
        const expectedChallenge = ChallengeStore.get(userId)?.challenge;

        const verification = await verifyRegistrationResponse({
            response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID,
            requireUserVerification: true,
        });

        if (verification.verified) {
            const { registrationInfo } = verification;
            await CredentialModel.create({
                userId,
                credentialId: registrationInfo.credentialID,
                publicKey: JSON.stringify(registrationInfo.credentialPublicKey),
                counter: registrationInfo.counter,
                aaguid: registrationInfo.aaguid
            });
            ChallengeStore.delete(userId);
            res.json({ verified: true });
        } else {
            res.status(400).json({ error: 'Verification failed' });
        }
    },

    async generateAuthOptions(req, res) {
        const { userId } = req.body;
        const options = await generateAuthenticationOptions({
            rpID,
            userVerification: 'required',
            allowCredentials: [], 
        });
        ChallengeStore.set(userId, options.challenge);
        res.json(options);
    },

    async verifyAuthentication(req, res) {
        const { userId, body, credentialId } = req.body;
        const expectedChallenge = ChallengeStore.get(userId)?.challenge;
        const credential = await CredentialModel.findById(credentialId);

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            requireUserVerification: true,
            authenticator: {
                credentialPublicKey: Buffer.from(JSON.parse(credential.public_key)),
                credentialID: credential.credential_id,
                counter: credential.counter,
            },
        });

        if (verification.verified) {
            res.json({ verified: true, message: 'Authentication successful' });
        } else {
            res.status(400).json({ error: 'Auth failed' });
        }
    }
};

module.exports = WebAuthnController;
