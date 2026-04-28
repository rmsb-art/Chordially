import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../lib/validate.js";
import { requireAuth } from "./auth.middleware.js";
import { requireRole } from "./permission-guards.js";

export const verificationRouter = Router();

type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationRequest {
  id: string;
  artistId: string;
  legalName: string;
  evidenceUrls: string[];
  payoutHandle: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

const requests = new Map<string, VerificationRequest>();

function getByArtistId(artistId: string): VerificationRequest | null {
  for (const r of requests.values()) {
    if (r.artistId === artistId) return r;
  }
  return null;
}

const submitSchema = z.object({
  legalName: z.string().min(1).max(120),
  evidenceUrls: z.array(z.string().url()).min(1).max(5),
  payoutHandle: z.string().min(1).max(80)
});

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().max(500).optional()
});

/** POST /auth/verification/submit — artist submits a verification request */
verificationRouter.post(
  "/verification/submit",
  requireAuth,
  requireRole("artist"),
  validateBody(submitSchema),
  (req, res) => {
    const user = req.authUser!;
    const existing = getByArtistId(user.id);

    if (existing && existing.status === "pending") {
      res.status(409).json({ error: "A verification request is already pending" });
      return;
    }

    const id = `vr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: VerificationRequest = {
      id,
      artistId: user.id,
      legalName: req.body.legalName,
      evidenceUrls: req.body.evidenceUrls,
      payoutHandle: req.body.payoutHandle,
      status: "pending",
      submittedAt: new Date().toISOString()
    };

    requests.set(id, record);
    console.info("[verification] request submitted", { id, artistId: user.id });

    res.status(201).json({
      id: record.id,
      status: record.status,
      submittedAt: record.submittedAt
    });
  }
);

/** GET /auth/verification/status — artist checks their own verification status */
verificationRouter.get("/verification/status", requireAuth, requireRole("artist"), (req, res) => {
  const user = req.authUser!;
  const record = getByArtistId(user.id);

  if (!record) {
    res.status(200).json({ status: "not_submitted" });
    return;
  }

  res.status(200).json({
    id: record.id,
    status: record.status,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt ?? null,
    reviewNote: record.reviewNote ?? null
  });
});

/** GET /auth/admin/verification — admin lists all pending requests */
verificationRouter.get(
  "/admin/verification",
  requireAuth,
  requireRole("admin"),
  (_req, res) => {
    const pending = [...requests.values()].filter((r) => r.status === "pending");
    res.status(200).json({ items: pending, total: pending.length });
  }
);

/** POST /auth/admin/verification/:id/review — admin approves or rejects */
verificationRouter.post(
  "/admin/verification/:id/review",
  requireAuth,
  requireRole("admin"),
  validateBody(reviewSchema),
  (req, res) => {
    const record = requests.get(req.params.id);

    if (!record) {
      res.status(404).json({ error: "Verification request not found" });
      return;
    }

    if (record.status !== "pending") {
      res.status(409).json({ error: "Request has already been reviewed" });
      return;
    }

    const updated: VerificationRequest = {
      ...record,
      status: req.body.status,
      reviewedAt: new Date().toISOString(),
      reviewNote: req.body.reviewNote
    };

    requests.set(record.id, updated);
    console.info("[verification] request reviewed", {
      id: record.id,
      status: updated.status,
      adminId: req.authUser!.id
    });

    res.status(200).json({ id: updated.id, status: updated.status, reviewedAt: updated.reviewedAt });
  }
);
