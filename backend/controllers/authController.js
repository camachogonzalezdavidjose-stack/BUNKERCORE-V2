const CredentialModel = require('../models/credential');

const AuthController = {
    async register(req, res) {
        try {
            const { userId, credentialId, publicKey, counter, aaguid } = req.body;
            const newCredential = await CredentialModel.create({ userId, credentialId, publicKey, counter, aaguid });
            res.status(201).json({ message: "Credential registered successfully", data: newCredential });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ error: "Failed to register credential" });
        }
    },

    async verify(req, res) {
        try {
            const { credentialId } = req.body;
            const credential = await CredentialModel.findByCredentialId(credentialId);
            if (!credential) return res.status(404).json({ error: "Credential not found" });
            res.status(200).json({ data: credential });
        } catch (error) {
            console.error("Verification error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

module.exports = AuthController;
