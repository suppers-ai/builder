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
  maxVisiblePages={5}
  onPageChange={(page) => console.log('Go to page:', page)}
/>`,
    showCode: true,
  },
  {
    title: "Without First/Last Buttons",
    description: "Pagination without first and last page buttons",
    code: `<Pagination
  currentPage={8}
  totalPages={20}
  showFirstLast={false}
  onPageChange={(page) => console.log('Go to page:', page)}
/>`,
    showCode: true,
  },
  {
    title: "Different Sizes",
    description: "Pagination in various sizes",
    code: `<div class="flex flex-col gap-6">
  <div>
    <h4 class="text-sm font-medium mb-2">Small</h4>
    <Pagination
      currentPage={2}
      totalPages={5}
      size="sm"
      onPageChange={(page) => console.log('Small pagination:', page)}
    />
  </div>
  <div>
    <h4 class="text-sm font-medium mb-2">Medium (Default)</h4>
    <Pagination
      currentPage={2}
      totalPages={5}
      size="md"
      onPageChange={(page) => console.log('Medium pagination:', page)}
    />
  </div>
  <div>
    <h4 class="text-sm font-medium mb-2">Large</h4>
    <Pagination
      currentPage={2}
      totalPages={5}
      size="lg"
      onPageChange={(page) => console.log('Large pagination:', page)}
    />
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "Edge Cases",
    description: "Pagination showing first page, last page, and single page behavior",
    code: `<div class="flex flex-col gap-6">
  <div>
    <h4 class="text-sm font-medium mb-2">First Page</h4>
    <Pagination
      currentPage={1}
      totalPages={10}
      onPageChange={(page) => console.log('First page:', page)}
    />
  </div>
  <div>
    <h4 class="text-sm font-medium mb-2">Last Page</h4>
    <Pagination
      currentPage={10}
      totalPages={10}
      onPageChange={(page) => console.log('Last page:', page)}
    />
  </div>
  <div>
    <h4 class="text-sm font-medium mb-2">Single Page (Hidden)</h4>
    <Pagination
      currentPage={1}
      totalPages={1}
      onPageChange={(page) => console.log('Single page:', page)}
    />
    <p class="text-sm text-gray-500 mt-2">Pagination is hidden when there's only one page</p>
  </div>
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
      size="sm"
    />
  ),
};
