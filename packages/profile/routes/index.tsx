import { type PageProps } from "fresh";
import LoginPageIsland from "../islands/LoginPageIsland.tsx";

export default function Home(props: PageProps) {
  return <LoginPageIsland redirectTo="/profile" />;
}
