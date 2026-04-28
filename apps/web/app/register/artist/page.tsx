import { Shell } from "../../../../components/layout/shell";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { registerArtist } from "./actions";

export default function ArtistRegisterPage() {
  return (
    <Shell
      title="Create an artist account"
      subtitle="Sign up directly as an artist or upgrade your existing fan account."
    >
      <Card title="Artist registration">
        <form action={registerArtist} className="stack">
          <div className="stack">
            <label htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="stack">
            <label htmlFor="username">Username</label>
            <Input id="username" name="username" required minLength={3} maxLength={24} />
          </div>
          <div className="stack">
            <label htmlFor="stageName">Stage name</label>
            <Input id="stageName" name="stageName" required maxLength={80} />
          </div>
          <div className="stack">
            <label htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <div className="stack" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input id="acceptedTerms" name="acceptedTerms" type="checkbox" value="true" required />
            <label htmlFor="acceptedTerms">I accept the terms of service and privacy policy</label>
          </div>
          <button className="button" type="submit">
            Create artist account
          </button>
          <p>
            Already have a fan account?{" "}
            <a href="/register/artist/upgrade">Upgrade to artist</a>
          </p>
        </form>
      </Card>
    </Shell>
  );
}
