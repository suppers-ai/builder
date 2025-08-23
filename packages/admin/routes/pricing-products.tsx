import { PageProps } from "fresh";
import PricingProductsIsland from "../islands/PricingProductsIsland.tsx";
import { API_BASE_URL } from "../lib/config.ts";

export default function PricingProductsPage(props: PageProps) {
  const baseUrl = API_BASE_URL;

  return <PricingProductsIsland baseUrl={baseUrl} />;
}
