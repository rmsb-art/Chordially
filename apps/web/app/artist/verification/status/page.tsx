import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Shell } from "../../../../../components/layout/shell";
import { Card } from "../../../../../components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface VerificationStatus {
  status: "not_submitted" | "pending" | "approved" | "rejected";
  submittedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

async function getVerificationStatus(token: string): Promise<VerificationStatus> {
  const res = await fetch(`${API_BASE}/auth/verification/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  if (!res.ok) return { status: "not_submitted" };
  return res.json();
}

const STATUS_LABELS: Record<VerificationStatus["status"], string> = {
  not_submitted: "Not submitted",
  pending: "Under review",
  approved: "Verified ✓",
  rejected: "Rejected"
};

export default async function VerificationStatusPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("chordially_token")?.value;

  if (!token) {
    redirect("/login?next=/artist/verification/status");
  }

  const data = await getVerificationStatus(token);

  return (
    <Shell title="Verification status" subtitle="">
      <Card title="Your verification">
        <p>
          <strong>Status:</strong> {STATUS_LABELS[data.status]}
        </p>
        {data.submittedAt && (
          <p>
            <strong>Submitted:</strong> {new Date(data.submittedAt).toLocaleDateString()}
          </p>
        )}
        {data.reviewedAt && (
          <p>
            <strong>Reviewed:</strong> {new Date(data.reviewedAt).toLocaleDateString()}
          </p>
        )}
        {data.reviewNote && (
          <p>
            <strong>Note:</strong> {data.reviewNote}
          </p>
        )}
        {data.status === "not_submitted" && (
          <a className="button" href="/artist/verification">
            Submit verification request
          </a>
        )}
        {data.status === "rejected" && (
          <a className="button" href="/artist/verification">
            Resubmit
          </a>
        )}
      </Card>
    </Shell>
  );
}
