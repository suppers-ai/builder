import { type PageProps } from "fresh";
import ProfilePageIsland from "../islands/ProfilePageIsland.tsx";

export default function Profile(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-100">
      <title>Profile - Suppers</title>
      <ProfilePageIsland />
    </div>
  );
}
