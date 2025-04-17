"use client";

import { ChevronRight, Home } from "lucide-react";

import HtmlSourceDataTable from "@/components/admin/html-source/data-table";

export default function HtmlSourcePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Quản lý HTML Source</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              HTML Source
            </h1>
            <p className="text-muted-foreground text-sm">
              Quản lý và giám sát HTML Source từ các ứng dụng
            </p>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div>
        {/* Table Section */}
        <div>
          <HtmlSourceDataTable />
        </div>
      </div>
    </div>
  );
}
