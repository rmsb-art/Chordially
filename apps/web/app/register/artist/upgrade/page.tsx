import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Shell } from "../../../../../components/layout/shell";
import { Card } from "../../../../../components/ui/card";
import { upgradeToArtist } from "../actions";

export default async function UpgradeToArtistPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("chordially_token")?.value;

  if (!token) {
    redirect("/login?next=/register/artist/upgrade");
  }

  async function handleUpgrade() {
    "use server";
    await upgradeToArtist(token!);
  }

  return (
    <Shell
      title="Upgrade to artist"
      subtitle="Unlock artist features: publish a profile, schedule sessions, and receive tips."
    >
      <Card title="Confirm upgrade">
        <form action={handleUpgrade} className="stack">
          <p>Your fan account will be upgraded to an artist account. This cannot be undone.</p>
          <button className="button" type="submit">
            Upgrade my account to artist
          </button>
          <p>
            <a href="/dashboard">Cancel</a>
          </p>
        </form>
      </Card>
    </Shell>
  );
}
