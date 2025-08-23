import { PageProps } from "fresh";
import SubscriptionsViewIsland from "../islands/SubscriptionsViewIsland.tsx";

export default function SubscriptionsPage(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-200">
      <SubscriptionsViewIsland />
    </div>
  );
}
