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

const MONTHS = 'jan|fév|fev|mar|avr|mai|juin|juil|aoû|aou|sep|oct|nov|déc|dec|janvier|février|mars|avril|juin|juillet|août|septembre|octobre|novembre|décembre';
const YEAR = '(?:19|20)\\d{2}';
const PRESENT = "(?:présent|present|aujourd['’]?hui|aujourdhui|actuel(?:le)?|now|en cours)";
const DATE_RANGE = new RegExp(
  `((?:${MONTHS})?\\.?\\s*${YEAR})\\s*[-–—àaà to]+\\s*((?:${MONTHS})?\\.?\\s*${YEAR}|${PRESENT})`,
  'i',
);
const SINGLE_YEAR = new RegExp(`\\b${YEAR}\\b`);

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

function extractExperiences(lines: string[]): CVExperience[] {
  const experiences: CVExperience[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(DATE_RANGE);
    if (!m) continue;

    const period = `${m[1].trim()} — ${m[2].trim()}`;
    let header = line.replace(DATE_RANGE, '').replace(/[|·•–—-]\s*$/, '').trim();
    if (header.length < 3) header = (lines[i - 1] ?? lines[i + 1] ?? '').trim();

    const context = [lines[i - 1], line, lines[i + 1]].filter(Boolean).join(' ');
    const { role, company } = splitRoleCompany(header);
    const description = lines[i + 1] && !DATE_RANGE.test(lines[i + 1]) ? lines[i + 1].slice(0, 160) : '';

    if (!role || EDUCATION_KEYWORDS.test(context)) continue;

    experiences.push({
      role: role.slice(0, 80),
      company: company.slice(0, 80) || '—',
      period,
      type: classifyType(context),
      description: description || 'Expérience extraite de votre document.',
    });
    if (experiences.length >= 8) break;
  }
  return experiences;
}

function extractEducation(lines: string[]): CVEducation[] {
  const education: CVEducation[] = [];
  for (const line of lines) {
    if (SECTION_HEADER.test(line)) continue;
    if (!EDUCATION_KEYWORDS.test(line)) continue;
    if (line.length > 120) continue;
    const yearMatch = line.match(SINGLE_YEAR);
    const year = yearMatch ? yearMatch[0] : '';
    const noYear = line.replace(SINGLE_YEAR, '').replace(/[·•]\s*$/, '').trim();
    const { role, company } = splitRoleCompany(noYear);
    education.push({
      degree: (role || noYear).slice(0, 80),
      school: company.slice(0, 80) || '—',
      year,
    });
    if (education.length >= 4) break;
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
  const lines = cleaned
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const skills = detectSkills(cleaned);
  const experiences = extractExperiences(lines);
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
