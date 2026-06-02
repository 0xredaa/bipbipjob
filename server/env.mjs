import dotenv from 'dotenv';

// Root .env holds DATABASE_URL / SESSION_TTL_DAYS (shared with Prisma CLI).
dotenv.config({ path: new URL('../.env', import.meta.url) });
// server/.env holds the LinkedIn OAuth credentials. (Does not override root.)
dotenv.config({ path: new URL('./.env', import.meta.url) });
