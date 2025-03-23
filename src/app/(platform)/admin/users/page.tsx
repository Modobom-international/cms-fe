"use client";

import React, { useState } from "react";

import Link from "next/link";

import { ChevronRight, Home, PlusIcon, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import UserDataTable from "@/components/admin/users/datatable";

export default function Page() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Quản lý nhân viên</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Nhân viên</h1>
            <p className="text-muted-foreground text-sm">
              Quản lý nhân viên và quyền của họ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/team"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              Phòng ban
            </Link>
            <Link
              href="/admin/users/create"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="">
        {/* Search Section */}
        <div className="py-4">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Tìm kiếm nhân viên..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div>
          <UserDataTable />
        </div>
      </div>
    </div>
  );
}
