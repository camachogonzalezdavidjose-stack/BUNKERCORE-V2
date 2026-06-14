const cryptoService = require('./backend/utils/cryptoService');

const originalData = "SuperSecretPublicKey_12345";
const encrypted = cryptoService.encrypt(originalData);
const decrypted = cryptoService.decrypt(encrypted);

console.log("Original:", originalData);
console.log("Cifrado (hex):", encrypted);
console.log("Descifrado:", decrypted);

if (originalData === decrypted) {
    console.log("¡Capa criptográfica VERIFICADA Y FUNCIONAL!");
} else {
    console.log("Error: La integridad de los datos falló.");
}
