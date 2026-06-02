export type ContractType = 'CDI' | 'CDD' | 'Freelance' | 'Stage' | 'Alternance';

export type Plan = 'free' | 'starter' | 'pro';

export type JobSector =
  | 'Tech'
  | 'Finance'
  | 'Logistique'
  | 'Design'
  | 'Marketing'
  | 'Commercial'
  | 'Santé'
  | 'RH';

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  contract: ContractType;
  sector: JobSector;
  salary: string;
  tags: string[];
  description: string;
  /** Optional explicit missions; otherwise derived from the sector. */
  missions?: string[];
  companyEmail: string;
  logoColor: string;
}

// --- CV analysis -------------------------------------------------------------

export interface CVExperience {
  role: string;
  company: string;
  period: string;
  type: ContractType;
  description: string;
}

export interface CVEducation {
  degree: string;
  school: string;
  year: string;
}

export interface CVAnalysis {
  /** Overall CV strength, 0–100. */
  score: number;
  summary: string;
  skills: string[];
  experiences: CVExperience[];
  education: CVEducation[];
  /** Sectors the CV is the best fit for. */
  suggestedSectors: JobSector[];
  yearsOfExperience: number;
}

export interface Credits {
  remaining: number;
  total: number;
  plan: Plan;
  /** ISO date string of next reset */
  resetAt: string;
}

export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'pending';

export interface Match {
  id: string;
  offer: JobOffer;
  matchedAt: string;
  emailStatus: EmailStatus;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string;
  cvFileName: string;
  contract: ContractType;
  job: string;
  location: string;
  bio: string;
  linkedinUrl?: string;
  /** Structured profile data imported from LinkedIn (experiences, skills…). */
  cvAnalysis?: CVAnalysis;
}

export type FeedbackType = 'bug' | 'suggestion' | 'praise' | 'other';

export interface Feedback {
  rating: number;
  type: FeedbackType;
  message: string;
}
