const fs = require('fs');

const path = 'c:\\Users\\ASUS\\Desktop\\CodeSklii\\frontend-react\\src\\pages\\SolveProblem.tsx';
let content = fs.readFileSync(path, 'utf8');

// Container
content = content.replace(/<div className="flex flex-col lg:flex-row min-h-\[calc\(100vh-64px\)\] lg:h-\[calc\(100vh-64px\)\] bg-\[#0B0F19\] text-text-inverse font-sans w-full overflow-y-auto lg:overflow-hidden">/,
  `<div className={\`flex flex-col lg:flex-row min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] bg-background dark:bg-[#0B0F19] text-text-primary dark:text-text-inverse font-sans w-full overflow-y-auto lg:overflow-hidden \${isFullscreen ? '!fixed !inset-0 !z-50 !h-screen !min-h-screen' : ''}\`}>`);

content = content.replace('if (!problem) return <div className="p-10 text-text-inverse">Loading...</div>;',
  'if (!problem) return <div className="p-10 text-text-primary dark:text-text-inverse">Loading...</div>;');

// Left Pane
content = content.replace(/bg-\[#0f172a\]/g, 'bg-surface dark:bg-[#0f172a]');
content = content.replace(/bg-slate-900\/50/g, 'bg-slate-100/50 dark:bg-slate-900/50');
content = content.replace(/text-text-inverse/g, 'text-text-primary dark:text-text-inverse');
content = content.replace(/bg-slate-800 rounded-lg hover:bg-slate-700 text-text-muted hover:text-text-inverse/g, 'bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-text-muted hover:text-text-primary dark:hover:text-text-inverse');
content = content.replace(/bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary hover:text-text-inverse/g, 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary dark:hover:text-text-inverse');
content = content.replace(/bg-primary hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-text-primary dark:text-text-inverse/g, 'bg-primary hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white');
content = content.replace(/prose-invert/g, 'dark:prose-invert');
content = content.replace(/bg-slate-800\/50/g, 'bg-slate-100/50 dark:bg-slate-800/50');

// Right Pane
content = content.replace(/bg-\[#1e1e1e\]/g, 'bg-white dark:bg-[#1e1e1e]');
content = content.replace(/bg-\[#252526\]/g, 'bg-slate-50 dark:bg-[#252526]');
content = content.replace(/bg-\[#3c3c3c\]/g, 'bg-white dark:bg-[#3c3c3c]');
content = content.replace(/border-none text-text-secondary/g, 'border border-border dark:border-none text-text-primary dark:text-text-secondary');

// Toolbar buttons
content = content.replace(/bg-slate-700 hover:bg-slate-600 text-text-primary dark:text-text-inverse/g, 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-text-primary dark:text-text-inverse');

// Submit button fix (was changed by text-text-inverse replace)
content = content.replace(/<Check className="w-4 h-4" \/>\s*<span>Submit<\/span>\s*<\/button>/,
  `<Check className="w-4 h-4" />\n              <span>Submit</span>\n            </button>`);

// Full screen button insertion in toolbar (add it before the Compile & Run button)
content = content.replace(/<button\s*onClick=\{handleRun\}\s*disabled=\{isExecuting\}\s*className="flex items-center space-x-2 bg-slate-200/,
  `<button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-text-primary dark:text-text-inverse px-3 py-2 rounded-md text-sm font-bold transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>\n            <button\n              onClick={handleRun}\n              disabled={isExecuting}\n              className="flex items-center space-x-2 bg-slate-200`);

// Editor theme
content = content.replace(/theme="vs-dark"/, 'theme={isDarkMode ? "vs-dark" : "light"}');

// Test Suite Console
content = content.replace(/bg-\[#141824\]/g, 'bg-white dark:bg-[#141824]');
content = content.replace(/bg-\[#1a2032\]/g, 'bg-slate-50 dark:bg-[#1a2032]');
content = content.replace(/bg-slate-800\/80/g, 'bg-slate-100 dark:bg-slate-800/80');
content = content.replace(/bg-\[#121622\]/g, 'bg-surface dark:bg-[#121622]');
content = content.replace(/bg-\[#161b29\]/g, 'bg-slate-100 dark:bg-[#161b29]');

// Hover states for test suite tabs
content = content.replace(/hover:bg-\[#1a2032\]/g, 'hover:bg-slate-200 dark:hover:bg-[#1a2032]');
content = content.replace(/bg-slate-900\/60/g, 'bg-slate-100 dark:bg-slate-900/60');
content = content.replace(/bg-slate-900\/40/g, 'bg-slate-50 dark:bg-slate-900/40');

fs.writeFileSync(path, content);
console.log('Successfully updated SolveProblem.tsx for light mode and fullscreen.');
