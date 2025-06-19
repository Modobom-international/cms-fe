import React from "react";

import { IBreadcrumbItem } from "@/types/storage.type";

import { StorageBreadcrumb } from "@/components/storage/storage-breadcrumb";
import { StorageContent } from "@/components/storage/storage-content";

export default function StoragePage() {
  // Static mock breadcrumbs for server component
  const mockBreadcrumbs: IBreadcrumbItem[] = [
    { id: "root", name: "Home", path: "/" },
    { id: "documents", name: "Documents", path: "/documents/" },
    { id: "projects", name: "Projects", path: "/documents/projects/" },
    {
      id: "current",
      name: "Current Folder",
      path: "/documents/projects/current/",
    },
  ];

  return (
    <div className="h-full">
      {/* Breadcrumb Section */}
      <StorageBreadcrumb breadcrumbs={mockBreadcrumbs} />

      {/* Content Section with top margin to account for fixed breadcrumb */}
      <div className="mt-16">
        <StorageContent />
      </div>
    </div>
  );
}

