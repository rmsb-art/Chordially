import { Shell } from "../../../components/layout/shell";
import { Card } from "../../../components/ui/card";
import { acceptPolicies } from "./actions";

const TERMS_VERSION = "2026-04-01";
const PRIVACY_VERSION = "2026-04-01";

export default function LegalAcceptancePage() {
  return (
    <Shell
      title="Updated policies"
      subtitle="We've updated our terms of service and privacy policy. Please review and accept to continue."
    >
      <Card title="Policy acceptance required">
        <form action={acceptPolicies} className="stack">
          <input type="hidden" name="termsVersion" value={TERMS_VERSION} />
          <input type="hidden" name="privacyVersion" value={PRIVACY_VERSION} />
          <p>
            <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service (updated {TERMS_VERSION})
            </a>
          </p>
          <p>
            <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy (updated {PRIVACY_VERSION})
            </a>
          </p>
          <div className="stack" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input id="accept" name="accept" type="checkbox" value="true" required />
            <label htmlFor="accept">
              I have read and accept the updated Terms of Service and Privacy Policy
            </label>
          </div>
          <button className="button" type="submit">
            Accept and continue
          </button>
        </form>
      </Card>
    </Shell>
  );
}
