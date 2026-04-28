"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function registerArtist(formData: FormData) {
  const body = {
    email: String(formData.get("email") ?? "").trim(),
    username: String(formData.get("username") ?? "").trim(),
    stageName: String(formData.get("stageName") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    acceptedTerms: formData.get("acceptedTerms") === "true" ? true : undefined
  };

  const res = await fetch(`${API_BASE}/auth/register/artist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Registration failed");
  }

  const { token, user } = await res.json();

  const cookieStore = await cookies();
  cookieStore.set("chordially_session", Buffer.from(JSON.stringify({
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString("base64"), { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("chordially_token", token, { httpOnly: true, sameSite: "lax", path: "/" });

  redirect("/artist/onboarding");
}

export async function upgradeToArtist(token: string) {
  const res = await fetch(`${API_BASE}/auth/upgrade/artist`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Upgrade failed");
  }

  const { token: newToken, user } = await res.json();

  const cookieStore = await cookies();
  cookieStore.set("chordially_session", Buffer.from(JSON.stringify({
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString("base64"), { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("chordially_token", newToken, { httpOnly: true, sameSite: "lax", path: "/" });

  redirect("/artist/onboarding");
}
