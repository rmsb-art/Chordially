import express, { type Express } from "express";
import { z } from "zod";

import { env } from "./env.js";
import {
  getUserById,
  listUsers,
  loginUser,
  logoutUser,
  registerUser,
  rotateRefreshToken,
} from "./auth-store.js";
import { requireAuth } from "./auth-middleware.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  origin: z.string().optional(),
});

const logoutSchema = z.object({ token: z.string().min(1) });

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: env.APP_NAME });
  });

  app.get("/api/v1/meta", (_req, res) => {
    res.json({ app: "Chordially", phase: "hackathon-starter", currentMilestone: "authentication" });
  });

  app.get("/api/v1/auth/users", (_req, res) => {
    res.json({ users: listUsers() });
  });

  app.post("/api/v1/auth/register", (req, res) => {
    const payload = registerSchema.parse(req.body);
    const user = registerUser(payload);
    res.status(201).json({ message: "Registration starter flow completed.", user });
  });

  app.post("/api/v1/auth/login", (req, res) => {
    const payload = loginSchema.parse(req.body);
    const { session, refreshToken } = loginUser(payload);
    res.status(200).json({ message: "Login starter flow completed.", session, refreshToken });
  });

  app.post("/api/v1/auth/logout", (req, res) => {
    const { token } = logoutSchema.parse(req.body);
    const revoked = logoutUser(token);
    res.status(200).json({ message: revoked ? "Session revoked." : "Session was already absent." });
  });

  /**
   * GET /api/v1/auth/me
   * Returns the active contributor identity and session metadata.
   * Requires a valid Bearer JWT. Revoked or malformed tokens receive a 401.
   */
  app.get("/api/v1/auth/me", requireAuth, (req, res) => {
    const session = res.locals["session"] as import("@chordially/types").AuthSession;
    const user = getUserById(session.userId);
    if (!user) {
      res.status(401).json({ error: "INVALID_SESSION", message: "User not found." });
      return;
    }
    res.json({ user, session });
  });

  /**
   * POST /api/v1/auth/refresh
   * Rotates a refresh token: invalidates the old one and issues a fresh
   * access token + refresh token pair. Replay attempts are rejected with 401.
   */
  app.post("/api/v1/auth/refresh", (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = rotateRefreshToken(refreshToken);
    res.json({ session: result.session, refreshToken: result.refreshToken });
  });

  return app;
}
