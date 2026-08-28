const fs = require('fs');
const file = 'c:/Users/ASUS/Desktop/CodeSklii/frontend-react/src/pages/CompanyProblems.tsx';
const code = fs.readFileSync(file, 'utf8');
const lines = code.split('\n');

const startIndex = lines.findIndex(line => line.includes('Practice Questions</h3>'));
let endIndex = -1;
for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('          </div>') && lines[i+1] && lines[i+1].includes('        </div>') && lines[i+2] && lines[i+2].includes('      )}')) {
        endIndex = i;
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const newLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex)];
    fs.writeFileSync(file, newLines.join('\n'));
    console.log('Successfully removed Practice Questions section from line ' + (startIndex+1) + ' to ' + endIndex);
} else {
    console.log('Failed to find boundaries. Start:', startIndex, 'End:', endIndex);
}
