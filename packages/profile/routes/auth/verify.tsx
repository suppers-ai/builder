import { type PageProps } from "fresh";

export default function AuthVerify(props: PageProps) {
  // This component handles Supabase email verification redirects
  // and forwards them to our auth callback handler

  const url = new URL(props.url);
  const token = url.searchParams.get("token");
  const type = url.searchParams.get("type");
  const redirectTo = url.searchParams.get("redirect_to") || "/profile";

  // Build our callback URL with the token in the hash (as Supabase expects)
  const callbackUrl = new URL("/auth/callback", url.origin);
  callbackUrl.searchParams.set("type", type || "");
  callbackUrl.searchParams.set("redirect_to", redirectTo);
  callbackUrl.hash = `access_token=${token}&token_type=bearer`;

  // Redirect to our callback handler
  if (typeof globalThis !== "undefined" && globalThis.location) {
    globalThis.location.href = callbackUrl.toString();
  }

  return (
    <div class="min-h-screen bg-base-200 flex items-center justify-center">
      <div class="text-center">
        <div class="loading loading-spinner loading-lg mb-4"></div>
        <p>Verifying your email... Please wait.</p>
      </div>
    </div>
  );
}
