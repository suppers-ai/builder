import { type Context } from "fresh";
import SharePageIsland from "../../islands/SharePageIsland.tsx";

export default function ShareTokenPage(ctx: Context<any>) {
  const token = ctx.params.token;

  return (
    <>
      <head>
        <title>Shared Recording</title>
        <meta name="description" content="View a shared recording" />
        <meta property="og:title" content="Shared Recording" />
        <meta property="og:description" content="Someone shared a recording with you" />
        <meta property="og:type" content="video.other" />
      </head>
      <div class="min-h-screen bg-base-200">
        <SharePageIsland shareToken={token} />
      </div>
    </>
  );
}
