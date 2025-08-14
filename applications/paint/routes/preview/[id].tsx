import { RouteConfig } from "fresh";
import { PageProps } from "fresh";
import Layout from "../../components/Layout.tsx";
import PaintingPreviewIsland from "../../islands/PaintingPreviewIsland.tsx";

export const config: RouteConfig = {
  routeOverride: "/preview/:id",
};

interface PreviewPageProps {
  id: string;
}

export default function PreviewPage(props: PageProps<never, PreviewPageProps>) {
  const paintingId = props.params.id;

  return (
    <Layout>
      <div class="container mx-auto px-4 py-8">
        <PaintingPreviewIsland paintingId={paintingId} />
        
        <div class="mt-8 text-center">
          <a href="/gallery" class="btn btn-outline">
            ← Back to Gallery
          </a>
        </div>
      </div>
    </Layout>
  );
}