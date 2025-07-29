import { type PageProps } from "$fresh/runtime";
import { LogoutHandler } from "../../islands/LogoutHandler.tsx";

export default function Logout(props: PageProps) {
  return <LogoutHandler />;
}
