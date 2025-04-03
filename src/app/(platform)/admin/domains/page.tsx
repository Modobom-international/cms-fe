"use client";

import Link from "next/link";

import { ChevronRight, Home, PlusIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import DomainDataTable from "@/components/admin/domain/data-table";

export default function DomainPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Quản lý domain</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Domain</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý và giám sát hệ thống domain
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/domains/create"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Thêm domain
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div>
        {/* Table Section */}
        <div>
          <DomainDataTable />
        </div>
      </div>
    </div>
  );
}
