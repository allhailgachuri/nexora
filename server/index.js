// Universal Entrypoint for Subdirectory Execution (fixes /server/server/dist/index.js issue)
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, 'dist', 'index.js'),
  path.join(__dirname, 'server', 'dist', 'index.js'),
  path.join(__dirname, '..', 'server', 'dist', 'index.js')
];

let target = candidates.find(p => fs.existsSync(p));

if (target) {
  require(target);
} else {
  console.error('[NEXORA ERROR] Compiled server build not found in server subdirectory!');
  console.error('Looked in:', candidates);
  console.error('Please ensure your build command is: npm run build or tsc -p tsconfig.json');
  process.exit(1);
}
