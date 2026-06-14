const db = require('../config/db');

const CredentialModel = {
    async create(data) {
        const query = `
            INSERT INTO credentials 
            (user_id, credential_id, public_key, counter, aaguid) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id;
        `;
        const values = [
            data.userId, 
            data.credentialId, 
            data.publicKey, 
            data.counter, 
            data.aaguid
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async findById(credentialId) {
        const query = 'SELECT * FROM credentials WHERE credential_id = $1';
        const result = await db.query(query, [credentialId]);
        return result.rows[0];
    },

    async findByUserId(userId) {
        const query = 'SELECT * FROM credentials WHERE user_id = $1';
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    async updateCounter(credentialId, newCounter) {
        const query = 'UPDATE credentials SET counter = $1 WHERE credential_id = $2';
        await db.query(query, [newCounter, credentialId]);
    }
};

module.exports = CredentialModel;
