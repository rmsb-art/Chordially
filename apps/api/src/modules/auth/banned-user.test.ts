import { describe, it, expect } from "vitest";
import { createUser, banUser, isBanned } from "../auth.store.js";

describe("CHORD-108 banned-user enforcement", () => {
  it("bans a user and reports them as banned", () => {
    const user = createUser({
      email: `ban-test-${Date.now()}@example.com`,
      username: "ban_target",
      password: "securepass1",
      role: "fan"
    });
    expect(user).not.toBeNull();
    expect(isBanned(user!.id)).toBe(false);

    const ok = banUser(user!.id);
    expect(ok).toBe(true);
    expect(isBanned(user!.id)).toBe(true);
  });

  it("returns false for unknown userId", () => {
    expect(isBanned("nonexistent-id")).toBe(false);
  });

  it("banUser returns false for unknown userId", () => {
    expect(banUser("nonexistent-id")).toBe(false);
  });
});
