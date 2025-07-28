import { type PageProps } from "$fresh/runtime";
import LoginPageIsland from "../islands/LoginPageIsland.tsx";

export default function Login(props: PageProps) {
  const url = new URL(props.url);
  const mode = url.searchParams.get("mode") === "register" ? "register" : "login";
  const redirectTo = url.searchParams.get("redirect_to") || "/profile";

  return <LoginPageIsland initialMode={mode} redirectTo={redirectTo} />;
}