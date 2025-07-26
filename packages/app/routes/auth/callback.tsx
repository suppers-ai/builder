import { type PageProps } from "fresh";
import { AuthCallbackHandler } from "../../islands/AuthCallbackHandler.tsx";

export default function AuthCallback(props: PageProps) {
  return <AuthCallbackHandler url={props.url} />;
}