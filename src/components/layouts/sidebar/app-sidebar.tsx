"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Bell,
  GanttChartSquare,
  LayoutGrid,
  Network,
  PenTool,
  Server,
  SquareActivity,
  Terminal,
  User,
} from "lucide-react";

import { Icons } from "@/components/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/layouts/sidebar/nav-main";
import { NavSecondary } from "@/components/layouts/sidebar/nav-secondary";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutGrid,
      isActive: true,
    },
    {
      title: "Servers",
      url: "/admin/servers",
      icon: Server,
    },
    {
      title: "Domain",
      url: "/admin/domains",
      icon: Network,
    },
    {
      title: "User Tracking",
      url: "/admin/user-tracking",
      icon: Icons.tracking,
    },
    {
      title: "HTML Source",
      url: "/admin/html-source",
      icon: Terminal,
    },
    {
      title: "Activity Log",
      url: "/admin/activity-log",
      icon: SquareActivity,
    },
    {
      title: "Push System",
      url: "/admin/push-system",
      icon: Bell,
    },
    {
      title: "Teams",
      url: "/admin/teams",
      icon: Icons.team,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: User,
    },
    {
      title: "Studio",
      url: "/studio",
      icon: PenTool,
    },
    {
      title: "Board",
      url: "/workspaces",
      icon: GanttChartSquare,
    },
  ],
  navSecondary: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <div className="relative aspect-square size-8">
                    <Image
                      src="/img/logo.png"
                      alt="Modobom CMS"
                      className="h-full w-full"
                      fill
                    />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Modobom CMS</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
