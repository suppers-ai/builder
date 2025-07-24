import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Pagination } from "./Pagination.tsx";

const paginationExamples: ComponentExample[] = [
  {
    title: "Basic Pagination",
    description: "Simple pagination with previous/next buttons",
    code: `<Pagination
  currentPage={3}
  totalPages={10}
  onPageChange={(page) => console.log('Go to page:', page)}
/>`,
    showCode: true,
  },
  {
    title: "Pagination with Numbers",
    description: "Pagination showing page numbers",
    code: `<Pagination
  currentPage={5}
  totalPages={15}
  showPageNumbers
  maxVisiblePages={5}
  onPageChange={(page) => console.log('Go to page:', page)}
/>`,
    showCode: true,
  },
  {
    title: "Responsive Pagination",
    description: "Pagination that adapts to screen size",
    code: `<Pagination
  currentPage={8}
  totalPages={20}
  showPageNumbers
  responsive
  showFirstLast
  onPageChange={(page) => console.log('Go to page:', page)}
/>`,
    showCode: true,
  },
  {
    title: "Different Sizes",
    description: "Pagination in various sizes",
    code: `<div class="space-y-4">
  <Pagination
    currentPage={2}
    totalPages={5}
    size="sm"
    showPageNumbers
  />
  <Pagination
    currentPage={2}
    totalPages={5}
    size="md"
    showPageNumbers
  />
  <Pagination
    currentPage={2}
    totalPages={5}
    size="lg"
    showPageNumbers
  />
</div>`,
    showCode: true,
  },
  {
    title: "Disabled States",
    description: "Pagination with various disabled states",
    code: `<div class="space-y-4">
  <Pagination
    currentPage={1}
    totalPages={10}
    showPageNumbers
    onPageChange={(page) => console.log('First page:', page)}
  />
  <Pagination
    currentPage={10}
    totalPages={10}
    showPageNumbers
    onPageChange={(page) => console.log('Last page:', page)}
  />
  <Pagination
    currentPage={5}
    totalPages={10}
    showPageNumbers
    disabled
  />
</div>`,
    showCode: true,
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
      showPageNumbers
      size="sm"
    />
  ),
};
