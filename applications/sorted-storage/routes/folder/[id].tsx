/**
 * Folder-specific route for navigating to specific folders
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";
import StorageDashboardIsland from "../../islands/StorageDashboardIsland.tsx";

export default function FolderPage(props: PageProps) {
  const folderId = props.params.id;

  return (
    <Layout title={`Folder - Sorted Storage`} currentPath={`/folder/${folderId}`}>
      <div class="container mx-auto px-4 py-8">
        <StorageDashboardIsland />
      </div>
    </Layout>
  );
}
