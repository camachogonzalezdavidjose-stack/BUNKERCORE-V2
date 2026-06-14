require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const authController = require('./controllers/authController');
const webauthnController = require('./controllers/webauthnController');

const app = express();

// 1. Security: Helmet protects against common web vulnerabilities
app.use(helmet());

// 2. Parsers
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/verify', authController.verify);

// WebAuthn Routes
app.post('/api/webauthn/register-options', webauthnController.generateOptions);
app.post('/api/webauthn/verify-registration', webauthnController.verifyRegistration);
app.post('/api/webauthn/auth-options', webauthnController.generateAuthOptions);
app.post('/api/webauthn/verify-auth', webauthnController.verifyAuthentication);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BunkerCore-V2 server running on port ${PORT}`);
});
