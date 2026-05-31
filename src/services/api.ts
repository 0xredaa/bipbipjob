import type { CVAnalysis, Credits, Feedback, JobOffer, JobSector, User } from '@/types';
import { MOCK_OFFERS, buildMockCVAnalysis } from './mockData';

/**
 * Mocked API layer. Every call mimics a real network request (latency + shape)
 * so swapping these for `fetch`/axios later is a drop-in change.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- In-memory mock backend state --------------------------------------------
const RESET_HOURS = 24;

let creditsState: Credits = {
  remaining: 70,
  total: 70,
  plan: 'pro',
  resetAt: new Date(Date.now() + RESET_HOURS * 3600 * 1000).toISOString(),
};

let offerCursor = 0;

// --- Endpoints ---------------------------------------------------------------

export async function getCredits(): Promise<Credits> {
  await delay(120);
  // Auto-reset when the window elapses, like a real quota system would.
  if (new Date(creditsState.resetAt).getTime() < Date.now()) {
    creditsState = {
      ...creditsState,
      remaining: creditsState.total,
      resetAt: new Date(Date.now() + RESET_HOURS * 3600 * 1000).toISOString(),
    };
  }
  return { ...creditsState };
}

export async function consumeCredit(): Promise<{ success: boolean; remaining: number }> {
  await delay(160);
  if (creditsState.remaining <= 0) {
    return { success: false, remaining: 0 };
  }
  creditsState = { ...creditsState, remaining: creditsState.remaining - 1 };
  return { success: true, remaining: creditsState.remaining };
}

export async function sendMatch(
  offerId: string,
): Promise<{ success: boolean; emailSent: boolean; offerId: string }> {
  await delay(260);
  return { success: true, emailSent: true, offerId };
}

export async function getNextOffer(sectors?: JobSector[]): Promise<JobOffer> {
  await delay(140);
  // Filter by the user's selected sectors (empty/undefined = all sectors).
  const pool =
    sectors && sectors.length
      ? MOCK_OFFERS.filter((o) => sectors.includes(o.sector))
      : MOCK_OFFERS;
  const list = pool.length ? pool : MOCK_OFFERS;

  const offer = list[offerCursor % list.length];
  offerCursor += 1;
  // Give each cycled offer a unique id so list keys & matches never collide.
  const cycle = Math.floor((offerCursor - 1) / list.length);
  return cycle === 0 ? offer : { ...offer, id: `${offer.id}_c${cycle}` };
}

export async function analyzeCV(opts: {
  job?: string;
  contract?: User['contract'];
  firstName?: string;
}): Promise<CVAnalysis> {
  // Simulate an upload + NLP analysis round-trip.
  await delay(2200);
  return buildMockCVAnalysis(opts);
}

export async function sendFeedback(
  feedback: Feedback,
): Promise<{ success: boolean }> {
  await delay(400);
  // eslint-disable-next-line no-console
  console.info('[mock] feedback submitted', feedback);
  return { success: true };
}

export async function upgradePlan(plan: Credits['plan']): Promise<Credits> {
  await delay(300);
  const totals: Record<Credits['plan'], number> = { free: 10, starter: 30, pro: 70 };
  creditsState = {
    remaining: totals[plan],
    total: totals[plan],
    plan,
    resetAt: new Date(Date.now() + RESET_HOURS * 3600 * 1000).toISOString(),
  };
  return { ...creditsState };
}
