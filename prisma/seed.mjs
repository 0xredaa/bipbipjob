import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';

const prisma = new PrismaClient();

const offers = JSON.parse(
  readFileSync(new URL('../server/data/offers.json', import.meta.url), 'utf8'),
);

const DEMO_PROFILE = {
  score: 82,
  yearsOfExperience: 4,
  summary:
    'Profil full-stack avec une appétence 3D/web. Bonnes bases produit, expériences variées en startup.',
  skills: ['React', 'TypeScript', 'Three.js', 'Node.js', 'UI/UX', 'Git', 'Agile'],
  suggestedSectors: ['Tech', 'Design'],
  experiences: [
    { role: 'Développeur Full-Stack', company: 'Nebula Labs', period: "2023 — aujourd'hui", type: 'CDI', description: 'Interfaces 3D, dashboards analytics.' },
    { role: 'Développeur Frontend (alternance)', company: 'Orbit', period: '2021 — 2023', type: 'Alternance', description: 'Migration vers React + TS.' },
    { role: 'Stage Développeur Web', company: 'Pixelforge', period: '2021 (6 mois)', type: 'Stage', description: 'Expériences WebGL.' },
  ],
  education: [
    { degree: 'Master Informatique', school: 'EPITECH', year: '2023' },
    { degree: 'Licence Informatique', school: 'Université Paris-Saclay', year: '2021' },
  ],
};

async function main() {
  const offerCount = await prisma.offer.count();
  if (offerCount === 0) {
    await prisma.offer.createMany({ data: offers });
    console.log(`[seed] inserted ${offers.length} offers.`);
  } else {
    console.log(`[seed] ${offerCount} offers already present — skipping offers.`);
  }

  // Demo account: demo@bip.com / demo1234
  const existing = await prisma.user.findUnique({ where: { email: 'demo@bip.com' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: 'demo@bip.com',
        passwordHash: await bcrypt.hash('demo1234', 10),
        firstName: 'Reda',
        lastName: 'Benali',
        phone: '+33 6 12 34 56 78',
        cvFileName: 'CV_Reda_Benali_2026.pdf',
        contract: 'CDI',
        job: 'Développeur Full-Stack',
        location: 'Paris, France',
        bio: 'Ingénieur full-stack passionné par la 3D web.',
        profile: DEMO_PROFILE,
        plan: 'pro',
        creditsRemaining: 70,
        creditsTotal: 70,
        creditsResetAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    console.log('[seed] created demo user → demo@bip.com / demo1234');
  } else {
    console.log('[seed] demo user already present — skipping.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
