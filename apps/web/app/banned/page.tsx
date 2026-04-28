import { Shell } from "../../../components/layout/shell";
import { Card } from "../../../components/ui/card";

export default function BannedPage() {
  return (
    <Shell title="Account suspended" subtitle="">
      <Card title="Your account has been suspended">
        <p>
          Your account has been suspended due to a violation of our community guidelines or terms of
          service.
        </p>
        <p>
          If you believe this is a mistake, please contact{" "}
          <a href="mailto:support@chordially.com">support@chordially.com</a> to appeal.
        </p>
      </Card>
    </Shell>
  );
}
