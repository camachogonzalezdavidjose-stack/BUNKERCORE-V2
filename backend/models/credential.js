const db = require('../config/db');
const cryptoService = require('../utils/cryptoService');

const CredentialModel = {
    async findByCredentialId(credentialId) {
        const query = 'SELECT * FROM credentials WHERE credential_id = $1';
        const { rows } = await db.query(query, [credentialId]);
        if (rows[0]) {
            rows[0].public_key = cryptoService.decrypt(rows[0].public_key);
        }
        return rows[0];
    },

    async create(credentialData) {
        const { userId, credentialId, publicKey, counter, aaguid } = credentialData;
        const encryptedKey = cryptoService.encrypt(publicKey);
        const query = 'INSERT INTO credentials (user_id, credential_id, public_key, counter, aaguid) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const { rows } = await db.query(query, [userId, credentialId, encryptedKey, counter, aaguid]);
        return rows[0];
    }
};

module.exports = CredentialModel;
