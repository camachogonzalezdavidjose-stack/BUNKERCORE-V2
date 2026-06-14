const db = require('./backend/config/db');
const CredentialModel = require('./backend/models/credential');

async function testDefinitiveInsertion() {
    try {
        console.log("Creando usuario de prueba...");
        const userResult = await db.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id',
            ['BunkerUser_' + Date.now(), 'test@bunkercore.com']
        );
        const userId = userResult.rows[0].id;
        console.log("Usuario creado con ID:", userId);

        console.log("Insertando credencial para el usuario...");
        const testData = {
            userId: userId,
            credentialId: 'fido2-key-' + Date.now(),
            publicKey: 'real-public-key-data',
            counter: 0,
            aaguid: '00000000-0000-0000-0000-000000000000'
        };

        const result = await CredentialModel.create(testData);
        console.log("ÉXITO. Registro guardado:", result);
    } catch (error) {
        console.error("Error crítico:", error);
    } finally {
        process.exit();
    }
}

testDefinitiveInsertion();
