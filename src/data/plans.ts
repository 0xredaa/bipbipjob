import type { Plan } from '@/types';

export interface PlanInfo {
  key: Plan;
  name: string;
  price: string;
  period: string;
  /** Human label, e.g. "70 crédits / jour" */
  credits: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    key: 'free',
    name: 'Free',
    price: '0 €',
    period: '/mois',
    credits: '10 crédits / jour',
    features: ['Machine 3D complète', '10 matchs par jour', 'Inbox basique'],
    cta: 'Commencer',
    highlight: false,
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '19 €',
    period: '/mois',
    credits: '30 crédits / jour',
    features: ['Tout du Free', '30 matchs par jour', 'Statut email en temps réel', 'Support prioritaire'],
    cta: 'Choisir Starter',
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '49 €',
    period: '/mois',
    credits: '70 crédits / jour',
    features: ['Tout du Starter', '70 matchs par jour', 'CV multiples', 'Analytics avancés', 'Badge prioritaire entreprise'],
    cta: 'Passer au Pro',
    highlight: true,
  },
];
