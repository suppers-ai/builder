import * as CustomSimpleAuthButton from "../../../packages/ui-lib/components/custom/SimpleAuthButton.tsx";
import { getAuthClient } from "../lib/auth.ts";

export default function SimpleAuthButton() {
  const authClient = getAuthClient();
  return <CustomSimpleAuthButton.default 
    position="top" 
    authClient={authClient} 
  />;
}
