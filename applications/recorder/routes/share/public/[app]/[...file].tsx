import { type Context } from "fresh";
import SharePageIsland from "../../../../islands/SharePageIsland.tsx";

export default function SharePublicPage(ctx: Context<any>) {
  const { app, file } = ctx.params;
  const filename = Array.isArray(file) ? file.join('/') : file;

  return (
    <>
      <head>
        <title>Public Recording</title>
        <meta name="description" content="View a public recording" />
        <meta property="og:title" content="Public Recording" />
        <meta property="og:description" content="A publicly shared recording" />
        <meta property="og:type" content="video.other" />
      </head>
      <div class="min-h-screen bg-base-200">
        <SharePageIsland 
          applicationSlug={app}
          filename={filename}
          isPublic={true}
        />
      </div>
    </>
  );
}