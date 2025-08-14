import { type Context } from "fresh";
import SharePageIsland from "../../islands/SharePageIsland.tsx";

export default function ShareTokenPage(ctx: Context<any>) {
  const token = ctx.params.token;

  return (
    <>
      <head>
        <title>Shared Painting</title>
        <meta name="description" content="View a shared painting" />
        <meta property="og:title" content="Shared Painting" />
        <meta property="og:description" content="Someone shared a painting with you" />
        <meta property="og:type" content="website" />
      </head>
      <div class="min-h-screen bg-base-200">
        <SharePageIsland shareToken={token} />
      </div>
    </>
  );
}