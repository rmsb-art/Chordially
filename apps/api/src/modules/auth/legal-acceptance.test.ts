import { describe, it, expect } from "vitest";
import {
  getAcceptance,
  hasAcceptedCurrentPolicies,
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION
} from "../legal-acceptance.routes.js";

// Note: these tests exercise the store functions directly.
// The Map is module-level; tests that write must use unique userIds.

describe("CHORD-106 legal acceptance tracking", () => {
  it("returns null for a user who has never accepted", () => {
    expect(getAcceptance("unknown-user")).toBeNull();
    expect(hasAcceptedCurrentPolicies("unknown-user")).toBe(false);
  });

  it("reports current versions", () => {
    expect(CURRENT_TERMS_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(CURRENT_PRIVACY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
