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

interface Item {
  x: number;
  y: number;
  w: number;
  size: number;
  bold: boolean;
  str: string;
}

interface LineMeta {
  text: string;
  size: number;
  bold: boolean;
}

type StyleMap = Record<string, { fontFamily?: string } | undefined>;

// A bold/emphasised line is wrapped with this control char so the pure text
// parser (cvParse.ts) can tell which lines are visually emphasised (company
// names, job titles…) — information that is otherwise lost in plain text.
const STRONG = '';

function isBoldFont(fontName: string, styles: StyleMap): boolean {
  const fam = styles[fontName]?.fontFamily ?? '';
  return /bold|black|heavy|semibold|demibold|extrabold|w[5-9]00/i.test(fam);
}

/** Most frequent (rounded) glyph size on the page — i.e. the body text size. */
function bodyFontSize(items: Item[]): number {
  const counts = new Map<number, number>();
  for (const it of items) {
    const k = Math.round(it.size);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let best = 10;
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      best = k;
    }
  }
  return best;
}

/**
 * Extracts text in reading order, handling multi-column CV layouts: each page
 * is split at its widest vertical gutter so the left and right columns are read
 * separately (a naive Y-sort would interleave "FORMATION" with "EXPÉRIENCES").
 */
async function extractPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const out: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const width = page.getViewport({ scale: 1 }).width;
    const content = await page.getTextContent();

    const styles = content.styles as StyleMap;
    const items: Item[] = [];
    for (const it of content.items) {
      if (!('str' in it) || !it.str.trim()) continue;
      items.push({
        x: it.transform[4],
        y: it.transform[5],
        w: it.width ?? 0,
        size: Math.abs(it.transform[0]) || 10,
        bold: isBoldFont(it.fontName, styles),
        str: it.str,
      });
    }
    if (!items.length) continue;

    const bodySize = bodyFontSize(items);
    // A line stands out (company name / job title) when it is bold or clearly
    // larger than the body text — mark those so cvParse can use the emphasis.
    const emit = (metas: LineMeta[]) =>
      metas.forEach((m) =>
        out.push(m.bold || m.size >= bodySize * 1.12 ? STRONG + m.text : m.text),
      );

    const split = detectColumnSplit(items, width);
    if (split == null) {
      emit(buildLines(items));
    } else {
      const left = items.filter((it) => it.x + it.w / 2 < split);
      const right = items.filter((it) => it.x + it.w / 2 >= split);
      emit(buildLines(left));
      emit(buildLines(right));
    }
  }
  return out.join('\n');
}

/** Returns the X of a clear vertical gutter (2-column layout), or null. */
function detectColumnSplit(items: Item[], width: number): number | null {
  const BIN = Math.max(4, width / 200);
  const occupied = new Array(Math.ceil(width / BIN) + 1).fill(false);
  for (const it of items) {
    const start = Math.max(0, Math.floor(it.x / BIN));
    const end = Math.min(occupied.length - 1, Math.floor((it.x + it.w) / BIN));
    for (let b = start; b <= end; b++) occupied[b] = true;
  }
  // Longest empty run within the central band → the gutter.
  let bestLen = 0;
  let bestCenter: number | null = null;
  let runStart = -1;
  for (let b = 0; b < occupied.length; b++) {
    const xc = b * BIN;
    const inBand = xc > width * 0.25 && xc < width * 0.78;
    if (!occupied[b] && inBand) {
      if (runStart < 0) runStart = b;
      const len = b - runStart + 1;
      if (len > bestLen) {
        bestLen = len;
        bestCenter = ((runStart + b) / 2) * BIN;
      }
    } else {
      runStart = -1;
    }
  }
  // Require a real gutter (≥ 4% of page width) and balanced columns.
  if (bestCenter == null || bestLen * BIN < width * 0.04) return null;
  const leftCount = items.filter((it) => it.x + it.w / 2 < bestCenter!).length;
  const ratio = leftCount / items.length;
  if (ratio < 0.15 || ratio > 0.85) return null;
  return bestCenter;
}

/** Rebuilds visual lines from items, joining glyphs without spurious spaces. */
function buildLines(items: Item[]): LineMeta[] {
  const rows = new Map<number, Item[]>();
  for (const it of items) {
    const y = Math.round(it.y / 2) * 2;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y)!.push(it);
  }
  const ys = [...rows.keys()].sort((a, b) => b - a); // top → bottom
  const lines: LineMeta[] = [];
  for (const y of ys) {
    const row = rows.get(y)!.sort((a, b) => a.x - b.x);
    let line = '';
    let prevEnd: number | null = null;
    let maxSize = 0;
    let boldW = 0;
    let totalW = 0;
    for (const it of row) {
      if (prevEnd != null) {
        const gap = it.x - prevEnd;
        // Add a space only on a real word gap; tiny gaps are mid-word splits.
        if (gap > it.size * 0.28) line += ' ';
      }
      line += it.str;
      prevEnd = it.x + it.w;
      maxSize = Math.max(maxSize, it.size);
      totalW += it.w;
      if (it.bold) boldW += it.w;
    }
    const cleaned = line.replace(/\s+/g, ' ').trim();
    // The line counts as bold when most of its width is bold glyphs.
    if (cleaned) lines.push({ text: cleaned, size: maxSize, bold: totalW > 0 && boldW / totalW > 0.55 });
  }
  return lines;
}
