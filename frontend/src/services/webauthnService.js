import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const API_BASE = 'http://127.0.0.1:3000/api';

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    } else {
      const text = await response.text();
      console.error('Server error (HTML/Text):', text);
      throw new Error(`Server error (${response.status}). Check console for details.`);
    }
  }
  return response.json();
};

export const registerUser = async (email) => {
  // 1. Get options from server
  const optionsResponse = await fetch(`${API_BASE}/webauthn/register-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const options = await handleResponse(optionsResponse);

  // 2. Start browser registration
  const attestation = await startRegistration(options);
  console.log('[WebAuthn] Attestation received from browser:', attestation);
  
  // 3. Verify with server
  const verificationResponse = await fetch(`${API_BASE}/webauthn/verify-registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, attestation }),
  });
  return await handleResponse(verificationResponse);
};

export const authenticateUser = async (email) => {
  // 1. Get options from server
  const optionsResponse = await fetch(`${API_BASE}/webauthn/auth-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const options = await handleResponse(optionsResponse);

  // 2. Start browser authentication
  const assertion = await startAuthentication(options);
  
  // 3. Verify with server
  const verificationResponse = await fetch(`${API_BASE}/webauthn/verify-auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, assertion }),
  });
  return await handleResponse(verificationResponse);
};
