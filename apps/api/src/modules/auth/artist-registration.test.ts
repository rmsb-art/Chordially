import { describe, it, expect, beforeEach } from "vitest";
import { createUser, upgradeToArtist, isBanned } from "../auth.store.js";

// Reset module state between tests by re-importing fresh instances
// (store uses module-level Map; tests run in isolation via vitest)

describe("CHORD-102 artist registration", () => {
  const base = {
    email: `artist-${Date.now()}@example.com`,
    username: "nova_chords",
    password: "securepass1",
    role: "artist" as const
  };

  it("creates an artist account directly", () => {
    const user = createUser(base);
    expect(user).not.toBeNull();
    expect(user?.role).toBe("artist");
  });

  it("rejects duplicate email", () => {
    const email = `dup-${Date.now()}@example.com`;
    createUser({ ...base, email });
    const second = createUser({ ...base, email });
    expect(second).toBeNull();
  });
});

describe("CHORD-102 fan-to-artist upgrade", () => {
  it("upgrades a fan to artist", () => {
    const fan = createUser({
      email: `fan-${Date.now()}@example.com`,
      username: "fan_user",
      password: "securepass1",
      role: "fan"
    });
    expect(fan?.role).toBe("fan");

    const upgraded = upgradeToArtist(fan!.id);
    expect(upgraded?.role).toBe("artist");
  });

  it("returns null for unknown userId", () => {
    expect(upgradeToArtist("nonexistent-id")).toBeNull();
  });
});
