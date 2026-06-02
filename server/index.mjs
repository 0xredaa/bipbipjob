import './env.mjs';
import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './db.mjs';

const {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REDIRECT_URI = 'http://localhost:5173/api/auth/linkedin/callback',
  FRONTEND_URL = 'http://localhost:5173',
  SESSION_TTL_DAYS = '7',
  PORT = 3001,
} = process.env;

const LINKEDIN_CONFIGURED = Boolean(LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET);
const SESSION_MS = Number(SESSION_TTL_DAYS) * 24 * 3600 * 1000;
const CREDIT_WINDOW_MS = 24 * 3600 * 1000;
const PLAN_TOTALS = { free: 10, starter: 30, pro: 70 };
const FETCH_TIMEOUT = 8000;

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());

const oauthStates = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, exp] of oauthStates) if (exp < now) oauthStates.delete(k);
}, 60_000).unref();

const log = (...a) => console.log(`[api ${new Date().toISOString()}]`, ...a);

// --- session helpers ---------------------------------------------------------

async function createSession(res, userId) {
  const session = await prisma.session.create({
    data: { userId, expiresAt: new Date(Date.now() + SESSION_MS) },
  });
  res.cookie('sid', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true behind HTTPS in production
    maxAge: SESSION_MS,
    path: '/',
  });
}

async function requireAuth(req, res, next) {
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).json({ error: 'Non authentifié' });
  const session = await prisma.session.findUnique({ where: { id: sid }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    res.clearCookie('sid');
    return res.status(401).json({ error: 'Session expirée' });
  }
  req.user = session.user;
  next();
}

// --- mappers -----------------------------------------------------------------

function publicUser(u) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    photoUrl: u.photoUrl,
    cvFileName: u.cvFileName,
    contract: u.contract,
    job: u.job,
    location: u.location,
    bio: u.bio,
    cvAnalysis: u.profile ?? undefined,
  };
}

/** Applies the rolling credit reset, persisting it, and returns the wallet. */
async function walletOf(user) {
  let { creditsRemaining, creditsTotal, plan, creditsResetAt } = user;
  if (new Date(creditsResetAt) < new Date()) {
    creditsRemaining = creditsTotal;
    creditsResetAt = new Date(Date.now() + CREDIT_WINDOW_MS);
    await prisma.user.update({
      where: { id: user.id },
      data: { creditsRemaining, creditsResetAt },
    });
  }
  return {
    remaining: creditsRemaining,
    total: creditsTotal,
    plan,
    resetAt: new Date(creditsResetAt).toISOString(),
  };
}

const mapOffer = (o) => ({
  id: o.id,
  title: o.title,
  company: o.company,
  location: o.location,
  contract: o.contract,
  sector: o.sector,
  salary: o.salary,
  tags: o.tags,
  description: o.description,
  missions: o.missions,
  companyEmail: o.companyEmail,
  logoColor: o.logoColor,
});

const mapMatch = (m) => ({
  id: m.id,
  offer: mapOffer(m.offer),
  matchedAt: m.matchedAt.toISOString(),
  emailStatus: m.emailStatus,
});

async function fetchJson(url, options = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: ac.signal });
    return { ok: res.ok, json: await res.json().catch(() => ({})) };
  } finally {
    clearTimeout(timer);
  }
}

// --- health ------------------------------------------------------------------

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, linkedinConfigured: LINKEDIN_CONFIGURED, uptime: process.uptime() }),
);

/** Diagnostics: shows exactly what the server sends to LinkedIn (no secret). */
app.get('/api/auth/linkedin/debug', (_req, res) => {
  const authorizeUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID || '(missing)');
  authorizeUrl.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
  authorizeUrl.searchParams.set('scope', 'openid profile email');
  res.json({
    configured: LINKEDIN_CONFIGURED,
    clientId: LINKEDIN_CLIENT_ID || null,
    secretPresent: Boolean(LINKEDIN_CLIENT_SECRET),
    redirectUri: LINKEDIN_REDIRECT_URI,
    scopes: 'openid profile email',
    // 👉 This redirect URI must be registered EXACTLY in your LinkedIn app's Auth tab.
    registerThisExactRedirectUrl: LINKEDIN_REDIRECT_URI,
    authorizeUrl: authorizeUrl.toString(),
  });
});

// --- auth: email + password --------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, ...rest } = req.body ?? {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Email et mot de passe (6+ caractères) requis.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: rest.firstName ?? '',
        lastName: rest.lastName ?? '',
        phone: rest.phone ?? '',
        photoUrl: rest.photoUrl ?? '',
        cvFileName: rest.cvFileName ?? '',
        contract: rest.contract ?? 'CDI',
        job: rest.job ?? '',
        location: rest.location ?? '',
        bio: rest.bio ?? '',
        plan: 'free',
        creditsRemaining: PLAN_TOTALS.free,
        creditsTotal: PLAN_TOTALS.free,
        creditsResetAt: new Date(Date.now() + CREDIT_WINDOW_MS),
      },
    });
    await createSession(res, user.id);
    res.json({ user: publicUser(user), credits: await walletOf(user) });
  } catch (e) {
    log('register error', e.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const user = await prisma.user.findUnique({ where: { email: email ?? '' } });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    await createSession(res, user.id);
    res.json({ user: publicUser(user), credits: await walletOf(user) });
  } catch (e) {
    log('login error', e.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const sid = req.cookies?.sid;
  if (sid) await prisma.session.delete({ where: { id: sid } }).catch(() => {});
  res.clearCookie('sid');
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user), credits: await walletOf(req.user) });
});

app.patch('/api/auth/profile', requireAuth, async (req, res) => {
  const b = req.body ?? {};
  const data = {};
  for (const k of ['firstName', 'lastName', 'phone', 'photoUrl', 'cvFileName', 'contract', 'job', 'location', 'bio']) {
    if (typeof b[k] === 'string') data[k] = b[k];
  }
  if (b.cvAnalysis !== undefined) data.profile = b.cvAnalysis;
  const user = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json({ user: publicUser(user) });
});

// --- auth: LinkedIn OIDC -----------------------------------------------------

app.get('/api/auth/linkedin', (_req, res) => {
  if (!LINKEDIN_CONFIGURED) {
    return res
      .status(500)
      .type('text/plain; charset=utf-8')
      .send('LinkedIn non configuré (server/.env).');
  }
  const state = crypto.randomBytes(16).toString('hex');
  oauthStates.set(state, Date.now() + 10 * 60 * 1000);
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
  url.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const back = (q) => {
    const u = new URL('/auth/linkedin', FRONTEND_URL);
    for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
    res.redirect(u.toString());
  };
  if (error) return back({ error: String(error_description || error) });
  if (!code || !state || !oauthStates.has(String(state))) {
    return back({ error: 'État OAuth invalide ou expiré.' });
  }
  oauthStates.delete(String(state));

  try {
    const token = await fetchJson('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
    });
    if (!token.ok || !token.json.access_token) {
      throw new Error(token.json.error_description || 'Échec token.');
    }
    const { json: info, ok } = await fetchJson('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.json.access_token}` },
    });
    if (!ok || !info.sub) throw new Error('Échec récupération profil.');

    let user = await prisma.user.findFirst({
      where: { OR: [{ linkedinSub: info.sub }, { email: info.email || '___' }] },
    });
    let isNew = false;
    if (!user) {
      isNew = true;
      user = await prisma.user.create({
        data: {
          email: info.email || `${info.sub}@linkedin.local`,
          linkedinSub: info.sub,
          firstName: info.given_name || '',
          lastName: info.family_name || '',
          photoUrl: info.picture || '',
          plan: 'free',
          creditsRemaining: PLAN_TOTALS.free,
          creditsTotal: PLAN_TOTALS.free,
          creditsResetAt: new Date(Date.now() + CREDIT_WINDOW_MS),
        },
      });
    } else if (!user.linkedinSub) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { linkedinSub: info.sub, photoUrl: user.photoUrl || info.picture || '' },
      });
    }
    await createSession(res, user.id);
    log('linkedin login', user.email, isNew ? '(new)' : '(returning)');
    back(isNew ? { ok: '1', new: '1' } : { ok: '1' });
  } catch (e) {
    log('linkedin error', e.message);
    back({ error: e.message || 'Erreur LinkedIn.' });
  }
});

// --- business: offers / credits / match --------------------------------------

app.get('/api/offers/next', requireAuth, async (req, res) => {
  const sectors = String(req.query.sectors || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const where = sectors.length ? { sector: { in: sectors } } : {};

  const matched = await prisma.match.findMany({
    where: { userId: req.user.id },
    select: { offerId: true },
  });
  const seen = matched.map((m) => m.offerId);

  let pool = await prisma.offer.findMany({ where: { ...where, id: { notIn: seen } } });
  if (pool.length === 0) pool = await prisma.offer.findMany({ where });
  if (pool.length === 0) return res.status(404).json({ error: 'Aucune offre.' });

  res.json(mapOffer(pool[Math.floor(Math.random() * pool.length)]));
});

app.get('/api/credits', requireAuth, async (req, res) => {
  res.json(await walletOf(req.user));
});

app.post('/api/match', requireAuth, async (req, res) => {
  const offerId = req.body?.offerId;
  if (!offerId) return res.status(400).json({ error: 'offerId requis.' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUnique({ where: { id: req.user.id } });
      let remaining = u.creditsRemaining;
      let resetAt = u.creditsResetAt;
      if (new Date(resetAt) < new Date()) {
        remaining = u.creditsTotal;
        resetAt = new Date(Date.now() + CREDIT_WINDOW_MS);
      }
      const wallet = (r) => ({
        remaining: r,
        total: u.creditsTotal,
        plan: u.plan,
        resetAt: new Date(resetAt).toISOString(),
      });

      if (remaining <= 0) {
        await tx.user.update({ where: { id: u.id }, data: { creditsRemaining: 0, creditsResetAt: resetAt } });
        return { success: false, credits: wallet(0) };
      }
      const offer = await tx.offer.findUnique({ where: { id: offerId } });
      if (!offer) throw new Error('Offre introuvable');

      remaining -= 1;
      await tx.user.update({
        where: { id: u.id },
        data: { creditsRemaining: remaining, creditsResetAt: resetAt },
      });
      const match = await tx.match.create({
        data: { userId: u.id, offerId, emailStatus: 'sent' },
        include: { offer: true },
      });
      return { success: true, emailSent: true, match: mapMatch(match), credits: wallet(remaining), offer };
    });

    if (result.success) {
      // TODO: real email delivery (Resend/Postmark/SES) with the CV attached.
      log(`match → would email CV to ${result.offer.companyEmail}`);
    }
    res.json({
      success: result.success,
      emailSent: result.success,
      match: result.match,
      credits: result.credits,
    });
  } catch (e) {
    log('match error', e.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/matches', requireAuth, async (req, res) => {
  const matches = await prisma.match.findMany({
    where: { userId: req.user.id },
    include: { offer: true },
    orderBy: { matchedAt: 'desc' },
  });
  res.json(matches.map(mapMatch));
});

app.post('/api/plan', requireAuth, async (req, res) => {
  const plan = req.body?.plan;
  if (!PLAN_TOTALS[plan]) return res.status(400).json({ error: 'Plan invalide.' });
  const total = PLAN_TOTALS[plan];
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      plan,
      creditsTotal: total,
      creditsRemaining: total,
      creditsResetAt: new Date(Date.now() + CREDIT_WINDOW_MS),
    },
  });
  res.json(await walletOf(user));
});

app.post('/api/feedback', async (req, res) => {
  const { rating, type, message } = req.body ?? {};
  if (!rating) return res.status(400).json({ error: 'Note requise.' });
  let userId = null;
  const sid = req.cookies?.sid;
  if (sid) {
    const s = await prisma.session.findUnique({ where: { id: sid } });
    if (s) userId = s.userId;
  }
  await prisma.feedback.create({
    data: { userId, rating: Number(rating), type: type ?? 'other', message: message ?? '' },
  });
  res.json({ success: true });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

const server = app.listen(Number(PORT), () => {
  log(`backend prêt sur http://localhost:${PORT}`);
  if (!LINKEDIN_CONFIGURED) log('⚠️  LinkedIn non configuré (server/.env).');
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => prisma.$disconnect().finally(() => process.exit(0)));
  });
}
