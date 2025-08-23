import { PageProps } from "fresh";
import VariableDefinitionsIsland from "../islands/VariableDefinitionsIsland.tsx";
import { API_BASE_URL } from "../lib/config.ts";

export default function VariableDefinitionsPage(props: PageProps) {
  const baseUrl = API_BASE_URL;

  return <VariableDefinitionsIsland baseUrl={baseUrl} />;
}
