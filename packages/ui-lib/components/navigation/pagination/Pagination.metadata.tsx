import { ComponentMetadata } from "../../types.ts";
import { Pagination } from "./Pagination.tsx";

export const paginationMetadata: ComponentMetadata = {
  name: "Pagination",
  description: "Page navigation controls",
  category: "Navigation",
  path: "/components/navigation/pagination",
  tags: ["pagination", "pages", "navigation", "paging", "controls", "next-prev"],
  examples: ["basic", "with-numbers", "responsive", "sizes", "disabled"],
  relatedComponents: ["button", "join", "table"],
  preview: (
    <Pagination
      currentPage={3}
      totalPages={10}
      showPageNumbers
      size="sm"
    />
  ),
};
