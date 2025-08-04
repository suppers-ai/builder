import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Pagination } from "./Pagination.tsx";

const paginationExamples: ComponentExample[] = [
  {
    title: "Basic Pagination",
    description: "Simple pagination with previous/next buttons",
    props: {
      currentPage: 1,
      totalPages: 10,
    },
  },
  {
    title: "Pagination with Numbers",
    description: "Pagination showing page numbers",
    props: {
      currentPage: 1,
      totalPages: 10,
    },
  },
  {
    title: "Without First/Last Buttons",
    description: "Pagination without first and last page buttons",
    props: {
      currentPage: 1,
      totalPages: 10,
    },
  },
  {
    title: "Different Sizes",
    description: "Pagination in various sizes",
    props: {
      currentPage: 1,
      totalPages: 10,
      size: "lg",
    },
  },
  {
    title: "Edge Cases",
    description: "Pagination showing first page, last page, and single page behavior",
    props: {
      currentPage: 1,
      totalPages: 10,
    },
  },
];

export const paginationMetadata: ComponentMetadata = {
  name: "Pagination",
  description: "Page navigation controls",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/pagination",
  tags: ["pagination", "pages", "navigation", "paging", "controls", "next-prev"],
  examples: paginationExamples,
  relatedComponents: ["button", "join", "table"],
  preview: (
    <Pagination
      currentPage={3}
      totalPages={10}
      size="sm"
    />
  ),
};
