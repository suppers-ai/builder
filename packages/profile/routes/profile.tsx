import { type PageProps } from "fresh";
import ProfilePageIsland from "../islands/ProfilePageIsland.tsx";

export default function Profile(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-300 flex items-center justify-center p-4">
      <title>Profile - Suppers</title>
      <div class="w-full max-w-md">
        <ProfilePageIsland />
      </div>
    </div>
  );
}