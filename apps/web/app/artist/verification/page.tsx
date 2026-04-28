import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Shell } from "../../../../components/layout/shell";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { submitVerification } from "./actions";

export default async function ArtistVerificationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("chordially_token")?.value;

  if (!token) {
    redirect("/login?next=/artist/verification");
  }

  return (
    <Shell
      title="Artist verification"
      subtitle="Submit your legal name, evidence, and payout details to get verified."
    >
      <Card title="Verification request">
        <form action={submitVerification} className="stack">
          <div className="stack">
            <label htmlFor="legalName">Legal name</label>
            <Input id="legalName" name="legalName" required maxLength={120} />
          </div>
          <div className="stack">
            <label htmlFor="evidenceUrl1">Evidence URL 1 (e.g. social profile, press link)</label>
            <Input id="evidenceUrl1" name="evidenceUrl1" type="url" required />
          </div>
          <div className="stack">
            <label htmlFor="evidenceUrl2">Evidence URL 2 (optional)</label>
            <Input id="evidenceUrl2" name="evidenceUrl2" type="url" />
          </div>
          <div className="stack">
            <label htmlFor="payoutHandle">Payout handle (Stellar address or email)</label>
            <Input id="payoutHandle" name="payoutHandle" required maxLength={80} />
          </div>
          <button className="button" type="submit">
            Submit for verification
          </button>
        </form>
      </Card>
    </Shell>
  );
}
