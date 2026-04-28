import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../lib/validate.js";
import { requireAuth } from "./auth.middleware.js";
import { createUser, getUserById, upgradeToArtist } from "./auth.store.js";
import { signToken } from "./auth.tokens.js";
import type { AuthResponse } from "@chordially/types";

export const artistAuthRouter = Router();

const artistRegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(72),
  stageName: z.string().min(1).max(80),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to register as an artist" })
  })
});

/** POST /auth/register/artist — direct artist sign-up */
artistAuthRouter.post(
  "/register/artist",
  validateBody(artistRegisterSchema),
  (req, res) => {
    const user = createUser({ ...req.body, role: "artist" });

    if (!user) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    console.info("[artist-registration] artist account created", { userId: user.id });

    const response: AuthResponse = { token: signToken(user.id), user };
    res.status(201).json(response);
  }
);

/** POST /auth/upgrade/artist — fan upgrades to artist role */
artistAuthRouter.post("/upgrade/artist", requireAuth, (req, res) => {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (user.role === "artist") {
    res.status(409).json({ error: "Account is already an artist" });
    return;
  }

  if (user.role === "admin") {
    res.status(403).json({ error: "Admin accounts cannot be upgraded" });
    return;
  }

  const upgraded = upgradeToArtist(user.id);
  if (!upgraded) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  console.info("[artist-registration] fan upgraded to artist", { userId: user.id });

  const response: AuthResponse = { token: signToken(upgraded.id), user: upgraded };
  res.status(200).json(response);
});

/** GET /auth/upgrade/artist/eligibility — check if current user can upgrade */
artistAuthRouter.get("/upgrade/artist/eligibility", requireAuth, (req, res) => {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  res.status(200).json({
    eligible: user.role === "fan",
    currentRole: user.role,
    reason: user.role === "artist"
      ? "already_artist"
      : user.role === "admin"
      ? "admin_account"
      : null
  });
});
