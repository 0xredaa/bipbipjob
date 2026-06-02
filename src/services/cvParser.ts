import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// Re-export the pure heuristic analyser so callers have a single entry point.
export { parseCVText } from './cvParse';

/** Extract plain text (line by line) from an uploaded PDF / text file. */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return extractPdf(file);
  if (name.endsWith('.txt') || file.type.startsWith('text/')) return file.text();
  try {
    return await file.text();
  } catch {
    return '';
  }
}

async function extractPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    // Reconstruct visual lines by bucketing items on their Y position.
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 2) * 2;
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: item.str });
    }
    const ys = [...rows.keys()].sort((a, b) => b - a);
    for (const y of ys) {
      const line = rows
        .get(y)!
        .sort((a, b) => a.x - b.x)
        .map((i) => i.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (line) lines.push(line);
    }
  }
  return lines.join('\n');
}
