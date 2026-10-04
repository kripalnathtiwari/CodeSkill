const fs = require('fs');
const path = 'c:\\Users\\ASUS\\Desktop\\CodeSklii\\frontend-react\\src\\pages\\SolveProblem.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add states for console resizing and toggle
content = content.replace(
  'const [isFullscreen, setIsFullscreen] = useState(false);',
  `const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(320);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      setConsoleHeight(Math.max(100, Math.min(800, startHeight + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };`
);

// 2. Add ChevronUp and ChevronDown to imports
if (!content.includes('ChevronDown')) {
  content = content.replace('ChevronRight,', 'ChevronRight, ChevronDown, ChevronUp,');
}

// 3. Make text bold in problem description
content = content.replace(
  'className="whitespace-pre-wrap font-sans text-text-secondary leading-relaxed bg-transparent p-0 text-base"',
  'className="whitespace-pre-wrap font-sans text-text-secondary leading-relaxed bg-transparent p-0 text-[15px] font-semibold"'
);

// 4. Make button text more visible
// Back button
content = content.replace(
  'className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-text-muted hover:text-text-primary dark:text-text-inverse transition-colors"',
  'className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-inverse transition-colors"'
);
// Prev button
content = content.replace(
  'className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary dark:text-text-inverse rounded-lg text-xs font-bold transition-all"',
  'className="flex items-center space-x-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-text-inverse rounded-lg text-xs font-bold transition-all"'
);
// Next button is already OK (bg-primary text-white)
// Compile & Run button
content = content.replace(
  'className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-text-primary dark:text-text-inverse px-5 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50"',
  'className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-text-inverse px-5 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50"'
);

// 5. Update Test Suite Console container
content = content.replace(
  /<div className="h-80 bg-white dark:bg-\[#141824\] flex flex-col flex-shrink-0 border-t border-border\/80 shadow-2xl">/g,
  `<div 
          className="bg-white dark:bg-[#141824] flex flex-col flex-shrink-0 border-t border-border/80 shadow-2xl"
          style={{ height: isConsoleOpen ? \`\${consoleHeight}px\` : '48px' }}
        >
        {isConsoleOpen && (
          <div 
            className="h-1.5 w-full cursor-row-resize bg-slate-200 dark:bg-slate-700 hover:bg-primary transition-colors flex items-center justify-center group"
            onMouseDown={startResize}
          >
            <div className="w-10 h-0.5 bg-slate-400 group-hover:bg-white rounded-full transition-colors"></div>
          </div>
        )}`
);

// Add toggle button to console header
content = content.replace(
  /<div className="px-4 py-2\.5 border-b border-border\/80 bg-slate-50 dark:bg-\[#1a2032\] flex items-center justify-between">\s*<div className="flex items-center space-x-3">\s*<div className="flex items-center space-x-2">/,
  `<div className="px-4 py-2.5 border-b border-border/80 bg-slate-50 dark:bg-[#1a2032] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsConsoleOpen(!isConsoleOpen)} 
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                title={isConsoleOpen ? "Collapse Console" : "Expand Console"}
              >
                {isConsoleOpen ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronUp className="w-4 h-4 text-text-secondary" />}
              </button>
              <div className="flex items-center space-x-2">`
);

// Hide content when console is collapsed
content = content.replace(
  /\{testResults\.length > 0 \? \(/g,
  `{isConsoleOpen && (testResults.length > 0 ? (`
);
content = content.replace(
  /<span className="text-sm">Click "Compile & Run" to test your code against all test cases.<\/span>\s*<\/div>\s*\)}/g,
  `<span className="text-sm">Click "Compile & Run" to test your code against all test cases.</span>
            </div>
          ))}`
);

fs.writeFileSync(path, content);
console.log('Successfully updated SolveProblem.tsx for resizing and UI fixes.');
