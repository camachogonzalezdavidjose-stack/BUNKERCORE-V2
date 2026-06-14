require('dotenv').config();
const crypto = require('crypto');

const secretKey = process.env.SECRET_KEY;
if (!secretKey) throw new Error("FATAL: SECRET_KEY is not defined.");

// Create a 32-byte key from the secret
const key = crypto.createHash('sha256').update(secretKey).digest();

const cryptoService = {
    encrypt: (text) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    },
    decrypt: (text) => {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};

module.exports = cryptoService;
