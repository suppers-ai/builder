import { type PageProps } from "$fresh/runtime";
import ProfilePageIsland from "../islands/ProfilePageIsland.tsx";

export default function Profile(props: PageProps) {
  return (
    <div>
      <title>Profile - Suppers</title>
      <ProfilePageIsland />
    </div>
  );
}
