const fs = require('fs');
const pkg = require('./package.json');

// Forzamos el uso de webpack en el build para entornos arm64/termux
pkg.scripts.build = "next build --webpack";

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('Script de build actualizado con éxito.');
