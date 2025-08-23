import { SimpleAuthButton } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";

export default function SortedStorageAuthButton() {
  const authClient = getAuthClient();
  return <SimpleAuthButton position="bottom" authClient={authClient} />;
}
