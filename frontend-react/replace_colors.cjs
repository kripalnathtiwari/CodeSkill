const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/ASUS/Desktop/CodeSklii/frontend-react/src');
let updatedCount = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/emerald/g, 'blue').replace(/teal/g, 'sky').replace(/cyan/g, 'sky');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    updatedCount++;
    console.log('Updated ' + file);
  }
});
console.log(`Finished updating ${updatedCount} files.`);
