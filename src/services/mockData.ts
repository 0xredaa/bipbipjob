import type { CVAnalysis, JobOffer, JobSector, User } from '@/types';

// --- Sectors -----------------------------------------------------------------

export interface SectorMeta {
  key: JobSector;
  label: string;
  color: string;
}

export const SECTORS: SectorMeta[] = [
  { key: 'Tech', label: 'Tech & IT', color: '#6366F1' },
  { key: 'Finance', label: 'Finance', color: '#10B981' },
  { key: 'Logistique', label: 'Logistique', color: '#F59E0B' },
  { key: 'Design', label: 'Design', color: '#EC4899' },
  { key: 'Marketing', label: 'Marketing', color: '#06B6D4' },
  { key: 'Commercial', label: 'Commercial', color: '#EF4444' },
  { key: 'Santé', label: 'Santé', color: '#14B8A6' },
  { key: 'RH', label: 'Ressources Humaines', color: '#8B5CF6' },
];

export const SECTOR_COLOR: Record<JobSector, string> = SECTORS.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.color }),
  {} as Record<JobSector, string>,
);

// --- Sample CV analysis (used as the default for the demo user) --------------

const SAMPLE_CV_ANALYSIS: CVAnalysis = {
  score: 82,
  yearsOfExperience: 4,
  summary:
    'Profil full-stack solide avec une appétence 3D/web. Bonnes bases produit, expériences variées en startup. Idéal pour des rôles Tech et Design.',
  skills: ['React', 'TypeScript', 'Three.js', 'Node.js', 'UI/UX', 'Git', 'Agile'],
  suggestedSectors: ['Tech', 'Design'],
  experiences: [
    {
      role: 'Développeur Full-Stack',
      company: 'Nebula Labs',
      period: '2023 — aujourd\'hui',
      type: 'CDI',
      description: 'Interfaces 3D, dashboards analytics, design system maison.',
    },
    {
      role: 'Développeur Frontend (alternance)',
      company: 'Orbit',
      period: '2021 — 2023',
      type: 'Alternance',
      description: 'Refonte du produit B2B, migration vers React + TS.',
    },
    {
      role: 'Stage Développeur Web',
      company: 'Pixelforge',
      period: '2021 (6 mois)',
      type: 'Stage',
      description: 'Expériences WebGL pour des marques de luxe.',
    },
  ],
  education: [
    { degree: 'Master Informatique', school: 'EPITECH', year: '2023' },
    { degree: 'Licence Informatique', school: 'Université Paris-Saclay', year: '2021' },
  ],
};

export const MOCK_USER: User = {
  id: 'usr_001',
  firstName: 'Reda',
  lastName: 'Benali',
  email: 'reda.benali@example.com',
  phone: '+33 6 12 34 56 78',
  photoUrl: '',
  cvFileName: 'CV_Reda_Benali_2026.pdf',
  contract: 'CDI',
  job: 'Développeur Full-Stack',
  location: 'Paris, France',
  bio: "Ingénieur full-stack passionné par la 3D web et les beaux produits SaaS.",
  cvAnalysis: SAMPLE_CV_ANALYSIS,
};

// --- Job offers across sectors -----------------------------------------------

export const MOCK_OFFERS: JobOffer[] = [
  // Tech
  {
    id: 'job_001',
    title: 'Senior Frontend Engineer',
    company: 'Nebula Labs',
    location: 'Paris, France',
    contract: 'CDI',
    sector: 'Tech',
    salary: '65–80k €',
    tags: ['React', 'Three.js', 'TypeScript'],
    description:
      'Construisez des interfaces 3D immersives pour notre plateforme analytics. Stack moderne, équipe produit forte.',
    companyEmail: 'jobs@nebulalabs.io',
    logoColor: '#6366F1',
  },
  {
    id: 'job_002',
    title: 'Backend Engineer (Go)',
    company: 'Cargologic',
    location: 'Remote',
    contract: 'Freelance',
    sector: 'Tech',
    salary: '550 €/jour',
    tags: ['Go', 'Kubernetes', 'gRPC'],
    description: 'Scalez notre moteur logistique temps réel. Millions de requêtes par jour.',
    companyEmail: 'hello@cargologic.com',
    logoColor: '#10B981',
  },
  {
    id: 'job_003',
    title: 'DevOps Engineer',
    company: 'Stackhouse',
    location: 'Nantes, France',
    contract: 'CDI',
    sector: 'Tech',
    salary: '52–68k €',
    tags: ['AWS', 'Terraform', 'CI/CD'],
    description: 'Industrialisez nos déploiements multi-cloud. Culture SRE, on-call léger.',
    companyEmail: 'recrutement@stackhouse.fr',
    logoColor: '#8B5CF6',
  },
  {
    id: 'job_004',
    title: 'Data Engineer',
    company: 'Quanta',
    location: 'Toulouse, France',
    contract: 'CDI',
    sector: 'Tech',
    salary: '54–70k €',
    tags: ['Python', 'Spark', 'dbt'],
    description: 'Bâtissez la plateforme data qui alimente nos modèles ML en production.',
    companyEmail: 'jobs@quanta.ai',
    logoColor: '#14B8A6',
  },
  // Finance
  {
    id: 'job_010',
    title: 'Analyste Financier',
    company: 'Meridian Capital',
    location: 'Paris, France',
    contract: 'CDI',
    sector: 'Finance',
    salary: '55–70k €',
    tags: ['Excel', 'Modélisation', 'M&A'],
    description: 'Analyse de portefeuilles et opérations M&A pour un fonds de premier plan.',
    companyEmail: 'careers@meridiancap.com',
    logoColor: '#10B981',
  },
  {
    id: 'job_011',
    title: 'Contrôleur de Gestion',
    company: 'Lumen Group',
    location: 'Lyon, France',
    contract: 'CDI',
    sector: 'Finance',
    salary: '45–58k €',
    tags: ['Reporting', 'SAP', 'Budget'],
    description: 'Pilotez la performance financière de 3 business units en forte croissance.',
    companyEmail: 'rh@lumengroup.fr',
    logoColor: '#059669',
  },
  {
    id: 'job_012',
    title: 'Stage Audit Financier',
    company: 'Deloitte',
    location: 'Paris, France',
    contract: 'Stage',
    sector: 'Finance',
    salary: '1 400 €/mois',
    tags: ['Audit', 'IFRS', 'Excel'],
    description: 'Stage de 6 mois en audit, missions clients grands comptes.',
    companyEmail: 'stages@deloitte.fr',
    logoColor: '#22C55E',
  },
  // Logistique
  {
    id: 'job_020',
    title: 'Responsable Supply Chain',
    company: 'TransGlobe',
    location: 'Le Havre, France',
    contract: 'CDI',
    sector: 'Logistique',
    salary: '50–65k €',
    tags: ['Supply Chain', 'ERP', 'Lean'],
    description: 'Optimisez les flux d\'un réseau de 12 entrepôts en Europe.',
    companyEmail: 'jobs@transglobe.com',
    logoColor: '#F59E0B',
  },
  {
    id: 'job_021',
    title: 'Chef d\'Équipe Entrepôt',
    company: 'Cargologic',
    location: 'Lille, France',
    contract: 'CDI',
    sector: 'Logistique',
    salary: '34–42k €',
    tags: ['Management', 'WMS', 'Sécurité'],
    description: 'Encadrez une équipe de 25 opérateurs sur un site automatisé.',
    companyEmail: 'recrut@cargologic.com',
    logoColor: '#D97706',
  },
  {
    id: 'job_022',
    title: 'Coordinateur Transport',
    company: 'FretExpress',
    location: 'Marseille, France',
    contract: 'CDD',
    sector: 'Logistique',
    salary: '32–38k €',
    tags: ['Transport', 'Planning', 'Douane'],
    description: 'Coordination des expéditions internationales, maritime et routier.',
    companyEmail: 'rh@fretexpress.fr',
    logoColor: '#FB923C',
  },
  // Design
  {
    id: 'job_030',
    title: 'Lead Product Designer',
    company: 'Orbit',
    location: 'Lyon, France',
    contract: 'CDI',
    sector: 'Design',
    salary: '55–70k €',
    tags: ['Figma', 'Design System', 'Motion'],
    description: "Pilotez le design d'un produit B2B utilisé par 50 000 entreprises.",
    companyEmail: 'talent@orbit.design',
    logoColor: '#EC4899',
  },
  {
    id: 'job_031',
    title: 'WebGL / 3D Designer',
    company: 'Pixelforge',
    location: 'Bordeaux, France',
    contract: 'CDD',
    sector: 'Design',
    salary: '48–58k €',
    tags: ['Blender', 'Shaders', 'R3F'],
    description: 'Créez des expériences 3D primées pour des marques de luxe.',
    companyEmail: 'careers@pixelforge.studio',
    logoColor: '#F472B6',
  },
  // Marketing
  {
    id: 'job_040',
    title: 'Growth Marketing Manager',
    company: 'Loopr',
    location: 'Remote',
    contract: 'CDI',
    sector: 'Marketing',
    salary: '50–64k €',
    tags: ['Growth', 'SEO', 'A/B'],
    description: "Possédez la boucle d'acquisition de notre SaaS en hyper-croissance.",
    companyEmail: 'jobs@loopr.app',
    logoColor: '#06B6D4',
  },
  {
    id: 'job_041',
    title: 'Content Manager',
    company: 'Brandwave',
    location: 'Paris, France',
    contract: 'Alternance',
    sector: 'Marketing',
    salary: '1 200 €/mois',
    tags: ['Content', 'Social', 'Copywriting'],
    description: 'Alternance : pilotez le contenu social d\'une marque lifestyle.',
    companyEmail: 'alternance@brandwave.fr',
    logoColor: '#22D3EE',
  },
  // Commercial
  {
    id: 'job_050',
    title: 'Account Executive',
    company: 'Salesly',
    location: 'Paris, France',
    contract: 'CDI',
    sector: 'Commercial',
    salary: '40k € + variable',
    tags: ['SaaS', 'Closing', 'CRM'],
    description: 'Cycle de vente complet sur des comptes mid-market. Variable déplafonné.',
    companyEmail: 'jobs@salesly.io',
    logoColor: '#EF4444',
  },
  {
    id: 'job_051',
    title: 'Business Developer',
    company: 'Nexa',
    location: 'Lille, France',
    contract: 'CDI',
    sector: 'Commercial',
    salary: '35k € + variable',
    tags: ['Prospection', 'B2B', 'Hunting'],
    description: 'Ouvrez de nouveaux marchés pour une scale-up industrielle.',
    companyEmail: 'rh@nexa.fr',
    logoColor: '#F87171',
  },
  // Santé
  {
    id: 'job_060',
    title: 'Infirmier·ère DE',
    company: 'Clinique du Parc',
    location: 'Lyon, France',
    contract: 'CDI',
    sector: 'Santé',
    salary: '32–40k €',
    tags: ['Soins', 'Bloc', 'Urgences'],
    description: 'Rejoignez un service de pointe, équipe bienveillante, planning stable.',
    companyEmail: 'rh@cliniqueduparc.fr',
    logoColor: '#14B8A6',
  },
  {
    id: 'job_061',
    title: 'Ingénieur Biomédical',
    company: 'MedTechOne',
    location: 'Grenoble, France',
    contract: 'CDI',
    sector: 'Santé',
    salary: '42–55k €',
    tags: ['Dispositifs', 'R&D', 'ISO 13485'],
    description: 'Conception de dispositifs médicaux innovants, de la R&D au marquage CE.',
    companyEmail: 'jobs@medtechone.com',
    logoColor: '#2DD4BF',
  },
  // RH
  {
    id: 'job_070',
    title: 'Talent Acquisition Manager',
    company: 'PeopleFirst',
    location: 'Remote',
    contract: 'CDI',
    sector: 'RH',
    salary: '45–58k €',
    tags: ['Recrutement', 'Sourcing', 'ATS'],
    description: 'Structurez le recrutement tech d\'une entreprise qui double chaque année.',
    companyEmail: 'jobs@peoplefirst.io',
    logoColor: '#8B5CF6',
  },
  {
    id: 'job_071',
    title: 'Chargé·e RH (alternance)',
    company: 'Lumen Group',
    location: 'Lyon, France',
    contract: 'Alternance',
    sector: 'RH',
    salary: '1 100 €/mois',
    tags: ['Paie', 'Onboarding', 'SIRH'],
    description: 'Alternance généraliste RH au sein d\'une équipe de 6 personnes.',
    companyEmail: 'alternance@lumengroup.fr',
    logoColor: '#A78BFA',
  },
];

// --- Mock CV analyzer --------------------------------------------------------

const SKILL_POOL = [
  'React', 'TypeScript', 'Python', 'SQL', 'Excel', 'Figma', 'Communication',
  'Gestion de projet', 'Anglais', 'Leadership', 'Analyse', 'Agile',
];

/**
 * Produces a plausible CV analysis. In a real app this would call an NLP/LLM
 * service; here we synthesise believable data, lightly seeded by the declared
 * job title so the result feels personalised.
 */
export function buildMockCVAnalysis(opts: {
  job?: string;
  contract?: User['contract'];
  firstName?: string;
}): CVAnalysis {
  const job = opts.job?.trim() || 'Candidat';
  const lower = job.toLowerCase();

  let suggestedSectors: JobSector[] = ['Tech'];
  if (/(financ|audit|compta|gestion|banqu)/.test(lower)) suggestedSectors = ['Finance', 'Commercial'];
  else if (/(logist|supply|transport|entrep)/.test(lower)) suggestedSectors = ['Logistique'];
  else if (/(design|ux|ui|graph)/.test(lower)) suggestedSectors = ['Design', 'Marketing'];
  else if (/(market|growth|content|communicat)/.test(lower)) suggestedSectors = ['Marketing'];
  else if (/(commerc|sales|vente|business)/.test(lower)) suggestedSectors = ['Commercial'];
  else if (/(infirm|santé|médic|soin)/.test(lower)) suggestedSectors = ['Santé'];
  else if (/(rh|ressources|recrut|talent|paie)/.test(lower)) suggestedSectors = ['RH'];
  else if (/(dev|engineer|data|software|web|info)/.test(lower)) suggestedSectors = ['Tech'];

  const years = 2 + Math.floor(Math.random() * 5);
  const score = 68 + Math.floor(Math.random() * 28);

  return {
    score,
    yearsOfExperience: years,
    summary: `Profil orienté ${job.toLowerCase()} avec ~${years} ans d'expérience. Bon équilibre entre compétences techniques et savoir-être. Recommandé pour les secteurs ${suggestedSectors.join(' & ')}.`,
    skills: SKILL_POOL.slice(0, 6 + Math.floor(Math.random() * 3)),
    suggestedSectors,
    experiences: [
      {
        role: job,
        company: 'Dernière entreprise',
        period: `${2026 - years} — aujourd'hui`,
        type: opts.contract ?? 'CDI',
        description: 'Poste actuel, responsabilités opérationnelles et projets clés.',
      },
      {
        role: `${job} junior`,
        company: 'Entreprise précédente',
        period: `${2026 - years - 2} — ${2026 - years}`,
        type: 'CDD',
        description: 'Montée en compétences et premières responsabilités.',
      },
      {
        role: `Stage ${job}`,
        company: 'Première expérience',
        period: `${2026 - years - 2} (6 mois)`,
        type: 'Stage',
        description: 'Stage de fin d\'études, découverte du métier.',
      },
    ],
    education: [
      { degree: 'Master / Bac+5', school: 'École supérieure', year: `${2026 - years}` },
      { degree: 'Licence / Bac+3', school: 'Université', year: `${2026 - years - 2}` },
    ],
  };
}
