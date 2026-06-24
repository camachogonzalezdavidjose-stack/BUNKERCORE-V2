const fs = require('fs');
let content = fs.readFileSync('./package.json', 'utf8');

// Limpiamos cualquier bloque de scripts corrupto previo
content = content.replace(/"scripts"\s*:\s*{[\s\S]*?}/, `"scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start"
}`);

fs.writeFileSync('./package.json', content);
console.log('¡package.json reconstruido y corregido!');
