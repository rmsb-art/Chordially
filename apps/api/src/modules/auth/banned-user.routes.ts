import { Router } from "express";
import { requireAuth } from "./auth.middleware.js";
import { requireRole } from "./permission-guards.js";
import { banUser, getUserById, isBanned } from "./auth.store.js";

export const bannedUserRouter = Router();

/**
 * Middleware: block requests from banned users.
 * Must be used after requireAuth.
 */
export function rejectBannedUser(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
) {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (isBanned(user.id)) {
    console.warn("[ban] blocked request from banned user", { userId: user.id, path: req.path });
    res.status(403).json({
      error: "account_banned",
      message: "Your account has been suspended. Contact support to appeal."
    });
    return;
  }

  next();
}

/** POST /auth/admin/ban/:userId — admin bans a user */
bannedUserRouter.post(
  "/admin/ban/:userId",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const { userId } = req.params;
    const target = getUserById(userId);

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (target.role === "admin") {
      res.status(403).json({ error: "Cannot ban an admin account" });
      return;
    }

    const ok = banUser(userId);
    if (!ok) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    console.info("[ban] user banned by admin", { targetUserId: userId, adminId: req.authUser!.id });
    res.status(200).json({ ok: true, userId, banned: true });
  }
);

/** GET /auth/admin/ban/:userId — check ban status */
bannedUserRouter.get(
  "/admin/ban/:userId",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    const { userId } = req.params;
    const banned = isBanned(userId);
    res.status(200).json({ userId, banned });
  }
);
