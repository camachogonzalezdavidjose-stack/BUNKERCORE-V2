const db = require('../config/db');

const UserModel = {
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    },

    async create(email, username) {
        const query = `
            INSERT INTO users (email, username) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const result = await db.query(query, [email, username || email.split('@')[0]]);
        return result.rows[0];
    }
};

module.exports = UserModel;
