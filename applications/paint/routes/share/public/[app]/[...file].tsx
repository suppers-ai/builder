import { type Context } from "fresh";
import SharePageIsland from "../../../../islands/SharePageIsland.tsx";

export default function SharePublicPage(ctx: Context<any>) {
  const { app, file } = ctx.params;
  const filename = Array.isArray(file) ? file.join("/") : file;

  return (
    <>
      <head>
        <title>Public Painting</title>
        <meta name="description" content="View a public painting" />
        <meta property="og:title" content="Public Painting" />
        <meta property="og:description" content="A publicly shared painting" />
        <meta property="og:type" content="website" />
      </head>
      <div class="min-h-screen bg-base-200">
        <SharePageIsland
          applicationSlug={app}
          filename={filename}
          isPublic
        />
      </div>
    </>
  );
}
