// Vercel serverless entrypoint. Re-exports the Express app from server/index.mjs
// as the function handler. vercel.json rewrites every /api/* request here, and
// Express still sees the original URL (e.g. /api/auth/linkedin), so all routes
// defined in server/index.mjs work unchanged.
export { default } from '../server/index.mjs';
