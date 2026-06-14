const axios = require('axios');

async function testWebAuthnRegistration() {
    try {
        const payload = {
            userId: 'admin-user-id-001',
            email: 'admin@bunkercore.com'
        };

        console.log("1. Requesting registration options from server...");
        const response = await axios.post('http://localhost:3000/api/webauthn/register-options', payload);
        
        console.log("Challenge successfully received:");
        console.log(response.data.challenge);
        
        console.log("2. Backend status: READY to receive FIDO2 signature.");
    } catch (error) {
        console.error("Test failed:", error.response?.data || error.message);
    }
}

testWebAuthnRegistration();
