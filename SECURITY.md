# Política de Seguridad de BunkerCore

## Versiones Soportadas

Actualmente, el enfoque de seguridad está centralizado en la implementación de WebAuthn para eliminar contraseñas.

| Versión | Soporte de Seguridad |
| :--- | :--- |
| 2.x | :white_check_mark: (Activa - FIDO2/Passkeys) |
| 1.x | :x: (Deprecada) |

## Reporte de Vulnerabilidades

BunkerCore prioriza la seguridad del usuario. Si descubres una vulnerabilidad, por favor no la hagas pública inmediatamente. Te pedimos que sigas este protocolo:

1. **Contacto Privado:** Envía un correo electrónico directamente al mantenedor del proyecto describiendo el problema, los pasos para reproducirlo y el impacto potencial.
2. **Evaluación:** El equipo de desarrollo revisará el reporte en un plazo máximo de 48 horas.
3. **Corrección:** Si se confirma, se trabajará en un parche de seguridad prioritario.
4. **Publicación:** Una vez que la corrección esté desplegada, se notificará a la comunidad mediante un *Security Advisory* en este repositorio.

## Consideraciones de Seguridad en WebAuthn
- **Privacidad:** Las llaves privadas se almacenan en el enclave seguro del hardware del usuario y nunca se transmiten al servidor.
- **Origen:** El protocolo está estrictamente vinculado al `rpID` configurado, previniendo ataques de suplantación de identidad (phishing).
