import * as CustomSimpleAuthButton from "../../../packages/ui-lib/components/custom/SimpleAuthButton.tsx";
import { getAuthClient } from "../lib/auth.ts";

export default function SimpleAuthButton() {
  const authClient = getAuthClient();
  return (
    <div style={{ width: "auto" }}>
      <style>
        {`
        .navbar-end div[class*="w-full"] {
          width: auto !important;
        }
      `}
      </style>
      <CustomSimpleAuthButton.default
        position="bottom"
        authClient={authClient}
      />
    </div>
  );
}
