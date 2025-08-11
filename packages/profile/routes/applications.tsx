import { type PageProps } from "fresh";
import ApplicationPortalIsland from "../islands/ApplicationPortalIsland.tsx";

export default function Applications(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-300">
      <title>My applications - Suppers</title>
      <ApplicationPortalIsland />
    </div>
  );
}
