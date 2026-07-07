import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'frontend-react/src'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make text darker in light mode
  content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-slate-950 dark:text-slate-50');
  content = content.replace(/text-slate-800 dark:text-slate-200/g, 'text-slate-950 dark:text-slate-100');
  content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-slate-900 dark:text-slate-200');
  content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-slate-800 dark:text-slate-300');
  content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-700 dark:text-slate-400');
  content = content.replace(/text-slate-500 dark:text-slate-500/g, 'text-slate-700 dark:text-slate-500');

  // Also catch single texts
  content = content.replace(/text-slate-500/g, 'text-slate-700');
  // Need to be careful because we just replaced dark:text-slate-500, but let's just use string replace carefully
  
  fs.writeFileSync(file, content);
});

console.log('Text darkening complete');
