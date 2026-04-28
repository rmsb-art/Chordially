import type { NextFunction, Request, Response } from "express";
import { hasAcceptedCurrentPolicies } from "./legal-acceptance.routes.js";

/**
 * Middleware: block requests from users who have not accepted the current
 * terms and privacy policy. Must be used after requireAuth.
 */
export function requireLegalAcceptance(req: Request, res: Response, next: NextFunction) {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!hasAcceptedCurrentPolicies(user.id)) {
    res.status(403).json({
      error: "legal_acceptance_required",
      message: "You must accept the current terms and privacy policy to continue."
    });
    return;
  }

  next();
}
