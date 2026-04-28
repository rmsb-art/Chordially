"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function submitVerification(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("chordially_token")?.value;

  if (!token) {
    redirect("/login?next=/artist/verification");
  }

  const evidenceUrls = [
    formData.get("evidenceUrl1"),
    formData.get("evidenceUrl2")
  ]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

  const body = {
    legalName: String(formData.get("legalName") ?? "").trim(),
    evidenceUrls,
    payoutHandle: String(formData.get("payoutHandle") ?? "").trim()
  };

  const res = await fetch(`${API_BASE}/auth/verification/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Submission failed");
  }

  redirect("/artist/verification/status");
}
