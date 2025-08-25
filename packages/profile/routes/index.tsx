import { type PageProps } from "fresh";
import LoginPageIsland from "../islands/LoginPageIsland.tsx";

export default function Home(props: PageProps) {
  const url = new URL(props.url);
  const mode = url.searchParams.get("mode") === "register" ? "register" : "login";
  const redirectTo = url.searchParams.get("redirect_to") || "/profile";
  const isModal = url.searchParams.get("modal") === "true";

  return (
    <LoginPageIsland
      initialMode={mode}
      redirectTo={redirectTo}
      isModal={isModal}
    />
  );
}