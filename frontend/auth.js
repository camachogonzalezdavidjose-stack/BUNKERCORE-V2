import { startRegistration } from '@simplewebauthn/browser';

async function registerUser(email, userId) {
    try {
        // 1. Fetch registration options from the server
        const response = await fetch('/generate-registration-options', {
            method: 'POST',
            body: JSON.stringify({ email, userId }),
            headers: { 'Content-Type': 'application/json' },
        });
        const options = await response.json();

        // 2. Start browser-based authentication flow (trigger biometric prompt)
        const attestationResponse = await startRegistration(options);

        // 3. Send signed response to the server for final verification
        const verification = await fetch('/verify-registration', {
            method: 'POST',
            body: JSON.stringify({ userId, body: attestationResponse }),
            headers: { 'Content-Type': 'application/json' },
        });
        
        const result = await verification.json();
        if (result.verified) {
            alert("Biometric registration completed successfully!");
        }
    } catch (error) {
        console.error("Registration error:", error);
    }
}
