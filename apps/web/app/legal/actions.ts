"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function acceptPolicies(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("chordially_token")?.value;

  if (!token) {
    redirect("/login?next=/legal");
  }

  const body = {
    termsVersion: String(formData.get("termsVersion") ?? ""),
    privacyVersion: String(formData.get("privacyVersion") ?? "")
  };

  const res = await fetch(`${API_BASE}/auth/legal/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to record acceptance");
  }

  redirect("/dashboard");
}
