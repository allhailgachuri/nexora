// Universal Entrypoint for Root Execution on Render, Railway, Fly.io, Heroku, Docker
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'server', 'dist', 'index.js'),
  path.join(__dirname, 'dist', 'index.js')
];

let target = candidates.find(p => fs.existsSync(p));

if (target) {
  require(target);
} else {
  console.error('[NEXORA ERROR] Compiled server build not found!');
  console.error('Looked in:', candidates);
  console.error('Please ensure your build command is: npm install && npm run build:server');
  process.exit(1);
}
