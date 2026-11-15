import * as pdfjsLib from "pdfjs-dist";

// Ensure worker is set up for PDF.js in the browser
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface ParsedQuestion {
  id: number;
  type?: 'mcq' | 'coding';
  text: string;
  options: string[];
  answer: string;
  qNum?: number;
}

/**
 * Filter out recurring page headers, footers, page numbers and instructions.
 */
function isNoiseLine(line: string): boolean {
  if (!line || line.trim() === "") return true;
  const l = line.trim();

  // Page numbers & running headers like "Page 1", "Page 2 of 5", "DSA Interview MCQs | Page 1"
  if (/^(?:.*\|\s*)?Page\s*\d+(?:\s*(?:of|\/)\s*\d+)?(?:\s*\|.*)?$/i.test(l)) return true;
  if (/^\s*-\s*\d+\s*-\s*$/.test(l)) return true;
  if (/^\d+\s*\/\s*\d+$/.test(l)) return true;

  // Specific common titles / paper subtitles
  if (/^DSA Interview MCQs(?:\s*\|\s*Page\s*\d+)?$/i.test(l)) return true;
  if (/^\d+\s*questions?\s*\|\s*\d+\s*options?/i.test(l)) return true;
  if (/^Choose the correct option/i.test(l)) return true;
  if (/^Answers and explanations on the last pages/i.test(l)) return true;
  if (/^Instructions\s*:/i.test(l)) return true;

  return false;
}

const OPT_INDEX_MAP: Record<string, number> = {
  '1': 0, '2': 1, '3': 2, '4': 3,
  'A': 0, 'B': 1, 'C': 2, 'D': 3,
  'a': 0, 'b': 1, 'c': 2, 'd': 3
};

/**
 * Extract lines from PDF using 2D coordinates (Y position for line grouping, X for word order).
 */
export async function extractLinesFromPdf(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group items by vertical position (Y coordinate in PDF coordinate system)
    const lineGroups: { y: number; items: { x: number; text: string }[] }[] = [];

    for (const item of content.items as any[]) {
      const str = item.str;
      if (!str || str.trim() === "") continue;

      const x = item.transform[4];
      const y = item.transform[5];

      let group = lineGroups.find(g => Math.abs(g.y - y) <= 3.5);
      if (!group) {
        group = { y, items: [] };
        lineGroups.push(group);
      }
      group.items.push({ x, text: str });
    }

    // Sort lines top to bottom (descending Y)
    lineGroups.sort((a, b) => b.y - a.y);

    // Within each line, sort words left to right (ascending X)
    for (const group of lineGroups) {
      group.items.sort((a, b) => a.x - b.x);
      const lineStr = group.items.map(it => it.text).join(" ").replace(/\s+/g, " ").trim();
      if (lineStr && !isNoiseLine(lineStr)) {
        allLines.push(lineStr);
      }
    }
  }

  return allLines;
}

/**
 * Parse structured MCQs from clean extracted lines of text.
 */
export function parseQuestionsFromLines(lines: string[]): ParsedQuestion[] {
  if (lines.length === 0) return [];

  // Check if there is an Answer Key / Solutions section at the end of the document
  const answerSectionIndex = lines.findIndex(l =>
    /^(?:answers?(?:\s*(?:&|and)\s*explanations?)?|answer\s*key|solutions?)\s*[:\-]?\s*$/i.test(l)
  );

  let questionLines = lines;
  let answerLines: string[] = [];

  if (answerSectionIndex !== -1) {
    questionLines = lines.slice(0, answerSectionIndex);
    answerLines = lines.slice(answerSectionIndex + 1);
  }

  // Parse answer key map (e.g. "1. 2" or "Q1. B" or "1) 2) O(log n)")
  const answerMap = new Map<number, number>();
  for (const aLine of answerLines) {
    const m = aLine.match(/^(?:Q\s*)?(\d+)[\.\)\-:]\s*[\(\[]?([1-4A-Da-d])[\)\]\.\-:]?/i);
    if (m) {
      const qNum = parseInt(m[1], 10);
      const optIdx = OPT_INDEX_MAP[m[2]];
      if (optIdx !== undefined) answerMap.set(qNum, optIdx);
    }
  }

  // Detect whether questions in this document start with explicit "Q1", "Question 1", etc.
  const hasExplicitQPrefix = questionLines.some(l =>
    /^(?:Q|Question|Prob|Problem)\s*#?\s*\d+[\.\)\-:]/i.test(l)
  );

  const isQuestionStart = (line: string) => {
    if (hasExplicitQPrefix) {
      return /^(?:Q|Question|Prob|Problem)\s*#?\s*\d+[\.\)\-:]\s*.+/i.test(line);
    }
    // Bare number with dot/paren followed by capital letter and full question sentence
    return /^\d+[\.\)]\s+[A-Z].{8,}/.test(line);
  };

  const getQuestionDetails = (line: string, fallbackNum: number) => {
    const m = line.match(/^(?:Q|Question|Prob|Problem)\s*#?\s*(\d+)[\.\)\-:]\s*(.+)/i) ||
              line.match(/^(\d+)[\.\)]\s+(.+)/);
    if (m) {
      return { qNum: parseInt(m[1], 10), text: m[2].trim() };
    }
    return { qNum: fallbackNum, text: line };
  };

  const singleOptionRegex = /^[\(\[]?\s*([1-4A-Da-d])\s*[\)\]\.\-:]\s*(.+)/;
  const inlinePattern = /(?:^|\s+)[\(\[]?([1-4A-Da-d])[\)\]\.\-:]\s*([^\n]+?)(?=(?:\s+[\(\[]?[1-4A-Da-d][\)\]\.\-:]|$))/g;
  const inlineAnswerRegex = /^(?:answer|ans|correct\s*(?:option|answer)?|solution)[\s:\-]*\(?\s*([1-4A-Da-d])\b(?:\s*[\)\.\-:]?\s*(.*))?/i;

  const questions: ParsedQuestion[] = [];
  let currentQ: ParsedQuestion | null = null;

  for (let i = 0; i < questionLines.length; i++) {
    const line = questionLines[i];

    // 1. Check if line starts a new question
    if (isQuestionStart(line)) {
      if (currentQ) {
        while (currentQ.options.length < 4) currentQ.options.push("");
        questions.push(currentQ);
      }
      const { qNum, text } = getQuestionDetails(line, questions.length + 1);
      currentQ = {
        id: Date.now() + i + Math.random(),
        qNum,
        type: 'mcq',
        text,
        options: [],
        answer: ""
      };
      continue;
    }

    if (!currentQ) continue;

    // 2. Check for inline answer right below the question/options
    const inlineAnsMatch = line.match(inlineAnswerRegex);
    if (inlineAnsMatch) {
      const optIdx = OPT_INDEX_MAP[inlineAnsMatch[1]];
      if (optIdx !== undefined && currentQ.options[optIdx]) {
        currentQ.answer = currentQ.options[optIdx];
      } else if (inlineAnsMatch[2]) {
        currentQ.answer = inlineAnsMatch[2].trim();
      }
      continue;
    }

    // 3. Check for multiple options on a single line (e.g. "1) A 2) B 3) C 4) D")
    const inlineMatches: { marker: string; text: string }[] = [];
    let im: RegExpExecArray | null;
    const re = new RegExp(inlinePattern.source, 'g');
    while ((im = re.exec(line)) !== null) {
      inlineMatches.push({ marker: im[1], text: im[2].trim() });
    }

    if (inlineMatches.length >= 2) {
      for (const m of inlineMatches) {
        const optIdx = OPT_INDEX_MAP[m.marker];
        if (optIdx !== undefined) {
          while (currentQ.options.length < optIdx) currentQ.options.push("");
          currentQ.options[optIdx] = m.text;
        } else {
          currentQ.options.push(m.text);
        }
      }
      continue;
    }

    // 4. Check for single option line (e.g. "1) O(n)" or "A) Stack")
    const optMatch = line.match(singleOptionRegex);
    if (optMatch && currentQ.options.length < 4) {
      const optIdx = OPT_INDEX_MAP[optMatch[1]];
      const optText = optMatch[2].trim();
      if (optIdx !== undefined) {
        while (currentQ.options.length < optIdx) currentQ.options.push("");
        currentQ.options[optIdx] = optText;
      } else {
        currentQ.options.push(optText);
      }
      continue;
    }

    // 5. Continuation text (either question text before options, or option text after last option)
    if (currentQ.options.length === 0) {
      currentQ.text += " " + line;
    } else {
      const lastIdx = currentQ.options.length - 1;
      currentQ.options[lastIdx] += " " + line;
    }
  }

  if (currentQ) {
    while (currentQ.options.length < 4) currentQ.options.push("");
    questions.push(currentQ);
  }

  // 6. Connect parsed answer key to corresponding questions
  for (const q of questions) {
    if (q.qNum && answerMap.has(q.qNum)) {
      const idx = answerMap.get(q.qNum)!;
      if (q.options[idx]) {
        q.answer = q.options[idx];
      }
    }
  }

  return questions.filter(q => q.text.trim().length > 0);
}

/**
 * Top-level convenience helper: takes a PDF file and returns all parsed questions.
 */
export async function parseQuestionsFromPdf(file: File): Promise<ParsedQuestion[]> {
  const lines = await extractLinesFromPdf(file);
  return parseQuestionsFromLines(lines);
}
