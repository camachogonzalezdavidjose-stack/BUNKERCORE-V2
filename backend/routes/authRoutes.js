const express = require('express');
const router = express.Router();
const { 
    generateOptions, 
    verifyRegistration, 
    generateAuthOptions, 
    verifyAuthentication 
} = require('../controllers/webauthnController');

router.post('/webauthn/register-options', generateOptions);
router.post('/webauthn/verify-registration', verifyRegistration);
router.post('/webauthn/auth-options', generateAuthOptions);
router.post('/webauthn/verify-auth', verifyAuthentication);

module.exports = router;
