const fs = require('fs');
const content = fs.readFileSync('mobile/dist/_expo/static/js/web/index-df287d160ae123dd12aa4f3102afc395.js', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);

console.log('--- Line 120 ---');
console.log(lines[119]);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('registerWebModule')) {
    console.log(`Line ${i+1} has registerWebModule:`, lines[i].substring(0, 500));
  }
}
