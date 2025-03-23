"use client";

import { useState } from "react";

import Link from "next/link";

import { ChevronRight, Home, PlusIcon, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import TeamsDataTable from "@/components/admin/teams/data-table";

interface Team {
  id: number;
  name: string;
  prefix_permissions: string;
}

interface TeamsPageProps {
  teams?: {
    data: Team[];
    links: any;
  };
}

export default function TeamsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Quản lý phòng ban</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Phòng ban</h1>
            <p className="text-muted-foreground text-sm">Quản lý phòng ban</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              Nhân viên
            </Link>
            <Link
              href="/admin/teams/create"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Thêm phòng ban
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div>
        {/* Search Section */}
        <div className="py-4">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Tìm kiếm phòng ban..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div>
          <TeamsDataTable />
        </div>
      </div>
    </div>
  );
}
