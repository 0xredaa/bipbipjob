import type { CVAnalysis, CVEducation, CVExperience, ContractType, JobSector } from '@/types';

// Pure, browser-agnostic CV/LinkedIn-PDF text → structured analysis heuristics.
// (No pdfjs import here so it stays unit-testable in plain Node.)

const SKILL_DICTIONARY = [
  // Tech
  'React', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'JavaScript', 'Node.js', 'Node',
  'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'Docker',
  'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Git', 'Linux',
  'Three.js', 'WebGL', 'HTML', 'CSS', 'Tailwind', 'Sass', 'Next.js', 'Vite',
  'TensorFlow', 'PyTorch', 'Pandas', 'Spark', 'dbt', 'Machine Learning', 'Data',
  // Design
  'Figma', 'Sketch', 'Adobe', 'Photoshop', 'Illustrator', 'InDesign', 'Blender',
  'UI', 'UX', 'Design System', 'Prototypage', 'Wireframe', 'Motion',
  // Finance / business
  'Excel', 'SAP', 'Power BI', 'Tableau', 'VBA', 'Comptabilité', 'Audit', 'IFRS',
  'Reporting', 'Budget', 'Contrôle de gestion', 'Modélisation', 'Trésorerie',
  'Fiscalité', 'Consolidation',
  // Marketing / sales
  'SEO', 'SEA', 'Google Analytics', 'CRM', 'Salesforce', 'HubSpot', 'Copywriting',
  'Content', 'Social Media', 'Growth', 'Ads', 'Email Marketing', 'Prospection',
  'Négociation', 'Closing',
  // Logistics / ops
  'Supply Chain', 'ERP', 'WMS', 'Lean', 'Six Sigma', 'Transport', 'Achats',
  'Approvisionnement', 'Planification',
  // Soft / general
  'Management', 'Leadership', 'Gestion de projet', 'Agile', 'Scrum', 'Communication',
  'Anglais', 'Espagnol', 'Allemand', 'Travail en équipe', 'Autonomie',
];

const SECTOR_KEYWORDS: Record<JobSector, string[]> = {
  Tech: ['développeur', 'developer', 'software', 'engineer', 'data', 'devops', 'web', 'informatique', 'react', 'python', 'java'],
  Finance: ['finance', 'comptab', 'audit', 'gestion', 'banque', 'trésorerie', 'fiscal', 'contrôl', 'analyste financier'],
  Logistique: ['logistique', 'supply', 'transport', 'entrepôt', 'approvisionn', 'achats', 'warehouse'],
  Design: ['design', 'designer', 'ux', 'ui', 'graphiste', 'figma', 'créa', 'motion'],
  Marketing: ['marketing', 'growth', 'seo', 'communication', 'content', 'brand', 'social media', 'digital'],
  Commercial: ['commercial', 'sales', 'vente', 'business developer', 'account', 'négoci', 'prospect'],
  Santé: ['infirm', 'santé', 'médic', 'soin', 'hôpital', 'clinique', 'pharma', 'biomédical'],
  RH: ['ressources humaines', 'recrut', 'talent', 'paie', 'sirh', 'rh ', 'onboarding'],
};

const MONTHS =
  'janvier|février|mars|avril|juillet|juin|mai|août|septembre|octobre|novembre|décembre|' +
  'january|february|march|april|june|july|august|september|october|november|december|' +
  'jan|fév|fev|feb|mar|avr|apr|jun|jul|aoû|aou|aug|sept|sep|oct|nov|déc|dec';
const YEAR = '(?:19|20)\\d{2}';
const PRESENT = "(?:présent|present|aujourd['’]?hui|aujourdhui|actuel(?:le)?|now|en cours)";
const DATE_RANGE = new RegExp(
  `((?:${MONTHS})?\\.?\\s*${YEAR})\\s*[-–—àaà to]+\\s*((?:${MONTHS})?\\.?\\s*${YEAR}|${PRESENT})`,
  'i',
);
const SINGLE_YEAR = new RegExp(`\\b${YEAR}\\b`);
// A leftover "header" that is only a month (e.g. "May") means the real title is
// on the line above — used to look past a bare date line.
const MONTH_ONLY = new RegExp(`^(?:${MONTHS})\\.?$`, 'i');
// "Mai - juillet 2024" style ranges where only the end carries the year.
const MONTH_RANGE = new RegExp(
  `((?:${MONTHS})\\.?)\\s*[-–—à]+\\s*((?:${MONTHS})\\.?\\s*${YEAR}|${PRESENT})`,
  'i',
);

// U+0002 marks bold/emphasised lines (set by the PDF extractor in cvParser.ts).
const STRONG = String.fromCharCode(2);
const BULLET_RE = /^\s*[•·▪◦‣●○*+‐-―-]\s+/;
const EXP_SECTION = /^(exp[ée]riences?|parcours|emplois?|work experience|professional experience)\b/i;
const EDU_SECTION = /^(formations?|[ée]ducation|education|dipl[ôo]mes?|scolarit[ée]|studies)\b/i;
const OTHER_SECTION =
  /^(comp[ée]tences|skills|langues|languages|centres?\s+d|projets?|projects|certifications?|int[ée]r[êe]ts|loisirs|hobbies|contact|profil|summary|r[ée]f[ée]rences?)\b/i;

interface Line {
  text: string;
  strong: boolean;
}

const EDUCATION_KEYWORDS =
  /\b(master|licence|bachelor|bts|dut|but|mba|doctorat|phd|ingénieur|ing\.|diplôme|baccalauréat|\bbac\b|université|universit|école|ecole|faculté|formation|msc|bsc)\b/i;

const INTERNSHIP_RE = /\b(stage|stagiaire|internship|intern)\b/i;
const ALTERNANCE_RE = /\b(alternance|apprenti|apprentissage|contrat pro)\b/i;
const FREELANCE_RE = /\b(freelance|indépendant|independant|consultant)\b/i;
const CDD_RE = /\bcdd\b/i;

const SECTION_HEADER =
  /^(formations?|éducation|education|diplômes?|expériences?|experiences?|compétences|competences|skills|parcours|projets?|langues|centres d['’]intérêt)\s*:?\s*$/i;

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectSkills(text: string): string[] {
  const lower = text.toLowerCase();
  let found = SKILL_DICTIONARY.filter((skill) => {
    const s = skill.toLowerCase();
    const re = new RegExp(`(^|[^a-z0-9+#.])${escapeRe(s)}([^a-z0-9+#]|$)`, 'i');
    return re.test(lower);
  });
  // Drop generic terms when a more specific variant is already present.
  const redundant: Record<string, string> = { Node: 'Node.js' };
  found = found.filter((s) => !(redundant[s] && found.includes(redundant[s])));
  return uniq(found).slice(0, 18);
}

function detectSectors(text: string): JobSector[] {
  const lower = text.toLowerCase();
  const hits = (kw: string) => new RegExp(`\\b${escapeRe(kw)}`, 'i').test(lower);
  const scored = (Object.keys(SECTOR_KEYWORDS) as JobSector[])
    .map((sector) => ({
      sector,
      score: SECTOR_KEYWORDS[sector].reduce((acc, kw) => acc + (hits(kw) ? 1 : 0), 0),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 2).map((s) => s.sector);
}

function classifyType(text: string): ContractType {
  if (INTERNSHIP_RE.test(text)) return 'Stage';
  if (ALTERNANCE_RE.test(text)) return 'Alternance';
  if (FREELANCE_RE.test(text)) return 'Freelance';
  if (CDD_RE.test(text)) return 'CDD';
  return 'CDI';
}

function splitRoleCompany(s: string): { role: string; company: string } {
  const parts = s.split(/\s+(?:[-–—|·•]|chez|at|@)\s+/i).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) return { role: parts[0], company: parts.slice(1).join(' · ') };
  return { role: s.trim(), company: '' };
}

const isSectionHeader = (t: string) =>
  t.length <= 40 && (EXP_SECTION.test(t) || EDU_SECTION.test(t) || OTHER_SECTION.test(t));

/**
 * Extracts experiences from emphasis-aware lines. Each entry is anchored on a
 * date range; the role/company come from the bold header line (the company is
 * the emphasised token), and the description is built from the bullet points /
 * lines underneath it — exactly the visual structure of a CV.
 */
function extractExperiences(rawLines: Line[]): CVExperience[] {
  const experiences: CVExperience[] = [];
  const n = rawLines.length;
  let section: 'exp' | 'edu' | 'other' | 'unknown' = 'unknown';

  const headerish = (l?: Line) =>
    !!l && l.strong && !BULLET_RE.test(l.text) && !DATE_RANGE.test(l.text) && l.text.length <= 70;

  for (let i = 0; i < n; i++) {
    const text = rawLines[i].text;

    // Track the current CV section so education isn't parsed as experience.
    if (isSectionHeader(text)) {
      section = EXP_SECTION.test(text) ? 'exp' : EDU_SECTION.test(text) ? 'edu' : 'other';
      continue;
    }
    if (section === 'edu') continue;

    const isDateLine = !BULLET_RE.test(text) && text.length < 70;
    const m = text.match(DATE_RANGE) || (isDateLine ? text.match(MONTH_RANGE) : null);
    if (!m) continue;

    const period = `${m[1].trim()} — ${m[2].trim()}`;

    // Header (role/company): the date line minus the date, else the nearest
    // non-bullet line just above (the common "Title \n Dates \n • …" layout).
    let header = text.replace(m[0], '').replace(/[|·•–—-]\s*$/, '').trim();
    let headerIdx = i;
    if (header.length < 3 || MONTH_ONLY.test(header)) {
      for (let j = i - 1; j >= Math.max(0, i - 2); j--) {
        const c = rawLines[j].text;
        if (c && !BULLET_RE.test(c) && !DATE_RANGE.test(c) && !isSectionHeader(c)) {
          header = c;
          headerIdx = j;
          break;
        }
      }
    }

    const context = [rawLines[headerIdx]?.text, rawLines[i - 1]?.text, text, rawLines[i + 1]?.text]
      .filter(Boolean)
      .join(' ');
    if (EDUCATION_KEYWORDS.test(header)) continue;
    if (section !== 'exp' && EDUCATION_KEYWORDS.test(context)) continue;

    let { role, company } = splitRoleCompany(header);

    // No "Role - Company" separator: the company is the bold neighbour line.
    if (!company) {
      for (const j of [headerIdx - 1, headerIdx + 1, i + 1]) {
        const c = rawLines[j];
        if (
          c &&
          c.strong &&
          c.text !== header &&
          !BULLET_RE.test(c.text) &&
          !DATE_RANGE.test(c.text) &&
          c.text.length <= 60
        ) {
          company = c.text;
          break;
        }
      }
    }

    // Description: bullet points / lines under the entry, until the next entry
    // header, a new date, or a section change.
    const desc: string[] = [];
    for (let j = i + 1; j < n && desc.length < 6; j++) {
      const c = rawLines[j];
      if (DATE_RANGE.test(c.text) || MONTH_RANGE.test(c.text)) break;
      if (isSectionHeader(c.text)) break;
      if (headerish(c) && desc.length > 0) break;
      const bullet = c.text.replace(BULLET_RE, '').trim();
      if (BULLET_RE.test(c.text) || bullet.length >= 15) desc.push(bullet);
    }

    if (!role) continue;

    experiences.push({
      role: role.slice(0, 80),
      company: (company || '—').slice(0, 80),
      period,
      type: classifyType(`${context} ${desc.join(' ')}`),
      description: desc.join(' • ').slice(0, 400) || 'Expérience extraite de votre document.',
    });
    if (experiences.length >= 8) break;
  }
  return experiences;
}

const DEGREE_RE =
  /\b(master|licence|bachelor|bts|dut|but|mba|doctorat|phd|ingénieur|diplôme|baccalauréat|\bbac\b|msc|bsc)\b/i;
const SCHOOL_RE = /(université|universit|école|ecole|faculté|institut|school|college)/i;
const YEAR_ONLY = /^\(?\s*(?:19|20)\d{2}(?:\s*[-–—]\s*(?:19|20)\d{2})?\s*\)?$/;

function extractEducation(lines: string[]): CVEducation[] {
  const education: CVEducation[] = [];
  for (let i = 0; i < lines.length && education.length < 4; i++) {
    const line = lines[i];
    if (SECTION_HEADER.test(line) || line.length > 120) continue;
    if (!DEGREE_RE.test(line)) continue; // only real degree titles, not bare schools

    const degree = line.replace(SINGLE_YEAR, '').replace(/[·•]\s*$/, '').trim();
    let year = (line.match(SINGLE_YEAR) ?? [''])[0];
    let school = '';
    // Year + school often sit on the next 1–2 lines.
    for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
      const nl = lines[j];
      if (!year && YEAR_ONLY.test(nl)) year = (nl.match(SINGLE_YEAR) ?? [''])[0];
      else if (!school && SCHOOL_RE.test(nl) && !DEGREE_RE.test(nl)) school = nl.trim();
    }
    education.push({ degree: degree.slice(0, 80), school: (school || '—').slice(0, 80), year });
  }
  return education;
}

function computeYears(experiences: CVExperience[], text: string): number {
  const hasPresent = /présent|present|aujourd|actuel|en cours|now/i.test(text);
  const years = (text.match(/(?:19|20)\d{2}/g) ?? []).map(Number).filter((y) => y >= 1980 && y <= 2026);
  if (years.length >= 1) {
    const max = hasPresent ? 2026 : Math.max(...years);
    const span = Math.min(2026, max) - Math.min(...years);
    return Math.max(0, Math.min(span, 45)) || Math.max(experiences.length, 1);
  }
  return Math.max(experiences.length, 1);
}

/**
 * Turn raw CV / LinkedIn-PDF text into a structured analysis using heuristics —
 * only data that actually appears in the document is surfaced.
 */
export function parseCVText(text: string, fallback: { job?: string }): CVAnalysis {
  const cleaned = text.replace(/ /g, ' ');
  const rawLines: Line[] = text
    .split('\n')
    .map((l) => ({
      strong: l.startsWith(STRONG),
      text: l.replace(new RegExp(STRONG, 'g'), '').replace(/\s+/g, ' ').trim(),
    }))
    .filter((l) => l.text.length > 0);

  const lines = rawLines.map((l) => l.text);

  const skills = detectSkills(cleaned);
  let experiences: CVExperience[] = [];
  try {
    experiences = extractExperiences(rawLines);
  } catch {
    experiences = []; // never let experience parsing break the whole import
  }
  const education = extractEducation(lines);
  let suggestedSectors = detectSectors(cleaned);
  if (suggestedSectors.length === 0) suggestedSectors = ['Tech'];

  const years = computeYears(experiences, cleaned);
  const score = Math.min(
    96,
    40 +
      Math.min(skills.length, 12) * 2 +
      Math.min(experiences.length, 5) * 5 +
      Math.min(education.length, 3) * 4 +
      (cleaned.length > 600 ? 6 : 0),
  );

  const internships = experiences.filter((e) => e.type === 'Stage' || e.type === 'Alternance').length;
  const summary =
    experiences.length > 0
      ? `${experiences.length} expérience${experiences.length > 1 ? 's' : ''} détectée${experiences.length > 1 ? 's' : ''}${
          internships ? ` (dont ${internships} stage/alternance)` : ''
        }, ${skills.length} compétences identifiées. Profil orienté ${suggestedSectors.join(' & ')}.`
      : `Nous avons identifié ${skills.length} compétences. Les expériences n'ont pas pu être structurées — vérifiez que le PDF contient du texte (pas une image scannée).`;

  const finalSummary =
    skills.length === 0 && experiences.length === 0 && fallback.job
      ? `Peu d'informations exploitables extraites du fichier. Profil déclaré : ${fallback.job}.`
      : summary;

  return {
    score,
    yearsOfExperience: years,
    summary: finalSummary,
    skills: skills.length ? skills : ['—'],
    suggestedSectors,
    experiences,
    education,
  };
}
