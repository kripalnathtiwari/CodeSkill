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
  
  // Replace primary colors to emerald/teal
  content = content.replace(/violet-/g, 'emerald-');
  content = content.replace(/indigo-/g, 'teal-');
  
  // Replace dark backgrounds with adaptive ones
  content = content.replace(/bg-slate-950/g, 'bg-slate-50 dark:bg-slate-950');
  content = content.replace(/bg-slate-900\/50/g, 'bg-slate-100/50 dark:bg-slate-900/50');
  content = content.replace(/bg-slate-900/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/bg-slate-800\/40/g, 'bg-slate-200/40 dark:bg-slate-800/40');
  
  // Replace text
  content = content.replace(/text-slate-100/g, 'text-slate-900 dark:text-slate-100');
  content = content.replace(/text-slate-200/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
  
  // Replace borders
  content = content.replace(/border-slate-800\/40/g, 'border-slate-200 dark:border-slate-800/40');
  content = content.replace(/border-slate-800\/50/g, 'border-slate-200 dark:border-slate-800/50');
  content = content.replace(/border-slate-800/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/border-slate-900/g, 'border-slate-300 dark:border-slate-900');
  
  fs.writeFileSync(file, content);
});

console.log('Recoloring complete');
