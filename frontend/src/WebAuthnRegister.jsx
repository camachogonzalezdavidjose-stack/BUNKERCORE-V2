import React from 'react';
import { registerUser } from './services/webauthnService';

const WebAuthnRegister = ({ userId }) => {
  const handleRegister = async () => {
    try {
      const result = await registerUser(userId);
      if (result.verified) {
        alert("¡Éxito! Autenticador registrado correctamente.");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error en el registro. Revisa la consola.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={handleRegister}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        Registrar Dispositivo (Passkey)
      </button>
    </div>
  );
};

export default WebAuthnRegister;
