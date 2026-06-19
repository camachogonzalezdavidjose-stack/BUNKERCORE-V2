const express = require('express');
const router = express.Router();
const webauthnController = require('../controllers/webauthnController');

router.post('/generate-options', webauthnController.generateOptions);
router.post('/verify-registration', webauthnController.verifyRegistration);
router.post('/generate-auth-options', webauthnController.generateAuthOptions);
router.post('/verify-authentication', webauthnController.verifyAuthentication);

module.exports = router;
