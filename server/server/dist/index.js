// Trampoline to handle nested /server/server/dist/index.js execution on Render/Railway
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, '..', '..', 'dist', 'index.js'),
  path.join(__dirname, '..', 'dist', 'index.js'),
  path.join(__dirname, '..', '..', 'server', 'dist', 'index.js')
];

let target = candidates.find(p => fs.existsSync(p));

if (target) {
  require(target);
} else {
  console.error('[NEXORA ERROR] Could not locate dist/index.js from nested server directory');
  process.exit(1);
}
