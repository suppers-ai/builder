import { PageProps } from "fresh";
import ProductsDashboardIsland from "../islands/ProductsDashboardIsland.tsx";

export default function ProductsPage(props: PageProps) {
  return (
    <div class="min-h-screen bg-base-200">
      <ProductsDashboardIsland />
    </div>
  );
}