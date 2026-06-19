const express = require('express');
const router = express.Router();
const webauthnController = require('../controllers/webauthnController');

// Rutas para Registro
router.post('/webauthn/register/generate', webauthnController.generateRegistrationOptions);
router.post('/webauthn/register/verify', webauthnController.verifyRegistration);

// Rutas para Autenticación
router.post('/webauthn/auth/generate', webauthnController.generateAuthenticationOptions);
router.post('/webauthn/auth/verify', webauthnController.verifyAuthentication);

module.exports = router;
