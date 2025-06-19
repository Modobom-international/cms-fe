"use client";

import * as React from "react";

import dynamic from "next/dynamic";

import { Files, Home, Image, Trash2, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import CommandMenu from "@/components/layouts/command-menu";
import { PlatformModeSwitcher } from "@/components/layouts/platform-mode-switcher";
import {
  storageMainNav,
  StorageMainNav,
} from "@/components/layouts/storage/storage-main-nav";

const NavUser = dynamic(
  () => import("@/components/layouts/nav-user").then((mod) => mod.NavUser),
  {
    loading: () => <Skeleton className="h-12 w-full rounded-lg" />,
    ssr: false,
  }
);

export function StorageSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <PlatformModeSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <StorageMainNav items={storageMainNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
