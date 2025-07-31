import { type PageProps } from "fresh";
import OAuthHandler from "../../islands/OAuthHandler.tsx";

export default function OAuth(props: PageProps) {
  return <OAuthHandler url={props.url} />;
}
