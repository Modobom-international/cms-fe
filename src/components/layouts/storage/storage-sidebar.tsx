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
import { NavMain } from "@/components/layouts/storage/nav-main";

const NavUser = dynamic(
  () => import("@/components/layouts/nav-user").then((mod) => mod.NavUser),
  {
    loading: () => <Skeleton className="h-12 w-full rounded-lg" />,
    ssr: false,
  }
);

export const navMain = [
  {
    title: "Home",
    url: "/storage",
    icon: Home,
  },
  {
    title: "My files",
    url: "/storage/my-files",
    icon: Files,
  },
  {
    title: "Photos",
    url: "/storage/photos",
    icon: Image,
  },
  {
    title: "Shared",
    url: "/storage/shared",
    icon: Users,
  },
  {
    title: "Trash",
    url: "/storage/trash",
    icon: Trash2,
  },
];

export function StorageSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <PlatformModeSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

