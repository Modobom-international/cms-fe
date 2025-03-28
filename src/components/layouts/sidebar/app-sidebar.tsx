"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  SquareTerminal,
  User,
} from "lucide-react";

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
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },

    {
      title: "Users & Teams",
      url: "#",
      icon: User,
      items: [
        {
          title: "Users List",
          url: "#",
        },
        {
          title: "Create new user",
          url: "#",
        },
        {
          title: "Teams List",
          url: "#",
        },
        {
          title: "Create new team",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
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
                      alt="Mondobom Platform"
                      className="h-full w-full"
                      fill
                    />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Mondobom Platform
                  </span>
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
