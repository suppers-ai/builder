import Layout from "../components/Layout.tsx";
import HomePageIsland from "../islands/HomePageIsland.tsx";

export default function Home() {
  return (
    <Layout title="Sorted Storage" currentPath="/">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-base-content mb-4">
            Sorted Storage
          </h1>
          <p class="text-lg text-base-content/70 mb-8">
            Your minimalist cloud storage solution
          </p>
          <HomePageIsland />
        </div>
      </div>
    </Layout>
  );
}
