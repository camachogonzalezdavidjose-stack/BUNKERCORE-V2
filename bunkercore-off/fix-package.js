const fs = require('fs');
const pkg = require('./package.json');

pkg.scripts = {
  "dev": "next dev --webpack",
  "build": "next build --webpack",
  "start": "next start"
};

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('¡package.json reparado con éxito!');
