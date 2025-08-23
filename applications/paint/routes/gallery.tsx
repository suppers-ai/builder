import Layout from "../components/Layout.tsx";
import PaintingGalleryIsland from "../islands/PaintingGalleryIsland.tsx";

export default function GalleryPage() {
  return (
    <Layout>
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold mb-2">My Paintings</h1>
          <p class="text-base-content/60">
            View, download, and manage your saved artwork
          </p>
        </div>

        <PaintingGalleryIsland />
      </div>
    </Layout>
  );
}
