import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../lib/validate.js";
import { requireAuth } from "./auth.middleware.js";

export const legalRouter = Router();

/** Current policy versions — bump these when policies change materially. */
export const CURRENT_TERMS_VERSION = "2026-04-01";
export const CURRENT_PRIVACY_VERSION = "2026-04-01";

interface LegalAcceptance {
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  ip?: string;
}

const acceptances = new Map<string, LegalAcceptance>();

export function getAcceptance(userId: string): LegalAcceptance | null {
  return acceptances.get(userId) ?? null;
}

export function hasAcceptedCurrentPolicies(userId: string): boolean {
  const a = acceptances.get(userId);
  if (!a) return false;
  return (
    a.termsVersion === CURRENT_TERMS_VERSION &&
    a.privacyVersion === CURRENT_PRIVACY_VERSION
  );
}

const acceptSchema = z.object({
  termsVersion: z.string().min(1),
  privacyVersion: z.string().min(1)
});

/** POST /auth/legal/accept — record user's acceptance of current policies */
legalRouter.post("/legal/accept", requireAuth, validateBody(acceptSchema), (req, res) => {
  const user = req.authUser!;
  const { termsVersion, privacyVersion } = req.body as z.infer<typeof acceptSchema>;

  if (
    termsVersion !== CURRENT_TERMS_VERSION ||
    privacyVersion !== CURRENT_PRIVACY_VERSION
  ) {
    res.status(400).json({
      error: "Outdated policy versions",
      current: { termsVersion: CURRENT_TERMS_VERSION, privacyVersion: CURRENT_PRIVACY_VERSION }
    });
    return;
  }

  const record: LegalAcceptance = {
    userId: user.id,
    termsVersion,
    privacyVersion,
    acceptedAt: new Date().toISOString(),
    ip: req.ip
  };

  acceptances.set(user.id, record);
  console.info("[legal] policy accepted", { userId: user.id, termsVersion, privacyVersion });

  res.status(200).json({ ok: true, acceptedAt: record.acceptedAt });
});

/** GET /auth/legal/status — check if current user has accepted current policies */
legalRouter.get("/legal/status", requireAuth, (req, res) => {
  const user = req.authUser!;
  const accepted = hasAcceptedCurrentPolicies(user.id);
  const record = getAcceptance(user.id);

  res.status(200).json({
    accepted,
    current: { termsVersion: CURRENT_TERMS_VERSION, privacyVersion: CURRENT_PRIVACY_VERSION },
    userAcceptance: record
      ? { termsVersion: record.termsVersion, privacyVersion: record.privacyVersion, acceptedAt: record.acceptedAt }
      : null
  });
});
