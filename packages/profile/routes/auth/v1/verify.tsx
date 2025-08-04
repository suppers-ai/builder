import { type PageProps } from "fresh";

export default function SupabaseVerify(props: PageProps) {
  // This handles Supabase's email verification redirects
  // Extract token and type from URL params and redirect to our callback handler

  const url = new URL(props.url);
  const token = url.searchParams.get("token");
  const type = url.searchParams.get("type");
  const redirectTo = url.searchParams.get("redirect_to") || "/profile";

  // Build our callback URL with the token in the hash (as expected by our callback handler)
  const callbackUrl = new URL("/auth/callback", url.origin);
  callbackUrl.searchParams.set("type", type || "");
  callbackUrl.searchParams.set("redirect_to", redirectTo);

  // Add token to hash if present
  if (token) {
    callbackUrl.hash = `access_token=${token}&token_type=bearer`;
  }

  return (
    <div class="min-h-screen bg-base-200 flex items-center justify-center">
      <div class="text-center">
        <div class="loading loading-spinner loading-lg mb-4"></div>
        <p class="mb-4">Verifying your email...</p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Redirect to our callback handler
              window.location.href = "${callbackUrl.toString()}";
            `,
          }}
        />
      </div>
    </div>
  );
}
