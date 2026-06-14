const express = require('express');
const router = express.Router();
const webauthnController = require('../controllers/webauthnController');

router.get('/webauthn/register-options', webauthnController.generateRegistrationOptions);
router.post('/webauthn/verify-registration', webauthnController.verifyRegistration);

module.exports = router;
