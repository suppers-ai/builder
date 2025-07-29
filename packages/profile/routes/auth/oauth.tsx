import { type PageProps } from "$fresh/runtime";
import { OAuthHandler } from "../../islands/OAuthHandler.tsx";

export default function OAuth(props: PageProps) {
  return <OAuthHandler url={props.url} />;
}
