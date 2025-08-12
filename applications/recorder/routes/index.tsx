import Layout from "../components/Layout.tsx";
import UnifiedRecorderIsland from "../islands/UnifiedRecorderIsland.tsx";
import { Video } from "lucide-preact";

export default function Home() {
  return (
    <Layout title="Screen Recorder">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-3">
            <Video class="w-12 h-12 text-primary" />
          </div>
          <h1 class="text-2xl font-semibold text-base-content mb-2">
            Screen Recorder
          </h1>
          <p class="text-base-content/60 text-sm">
            Record your screen and save to the cloud
          </p>
        </div>

        <UnifiedRecorderIsland />
      </div>
    </Layout>
  );
}