"use client";

import { type ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type Icon } from "@tabler/icons-react";
import {
  GanttChartSquare,
  Home,
  Info,
  KeyIcon,
  type LucideIcon,
  Network,
  PenTool,
  Server,
  SquareActivity,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Icons } from "@/components/ui/icons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import CommandMenu from "@/components/layouts/command-menu";

type IconType = Icon | LucideIcon | ComponentType<any>;

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: IconType;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <CommandMenu className="w-full" />
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              pathname === item.url ||
              (item.url !== "/admin" && pathname.startsWith(item.url + "/")) ||
              (item.url === "/admin" && pathname === "/admin");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "relative flex min-h-7 items-center rounded-md px-3 py-2 no-underline transition-all duration-200",
                    isActive && [
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    ]
                  )}
                  asChild
                >
                  <Link
                    href={item.url}
                    aria-current={isActive ? "page" : undefined}
                    className="flex w-full items-center"
                  >
                    {isActive && (
                      <div
                        className="bg-primary absolute top-1 bottom-1 left-1 w-[3px] rounded-[3px] opacity-100 transition-all duration-300"
                        style={{ marginRight: "1px" }}
                        aria-hidden="true"
                        data-testid="active-indicator"
                      />
                    )}

                    {/* Icon Container */}
                    <div className="flex w-6 shrink-0 items-center justify-center">
                      {item.icon && (
                        <item.icon className={cn("size-4 transition-colors")} />
                      )}
                    </div>

                    {/* Label Container */}
                    <span
                      className={cn(
                        "grow text-sm transition-colors",
                        isActive && "font-medium"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export const navMain = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
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
    title: "Activity Log",
    url: "/admin/activity-log",
    icon: SquareActivity,
  },
  {
    title: "App Information",
    url: "/admin/app-information",
    icon: Info,
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
  {
    title: "API Keys",
    url: "/admin/api-keys",
    icon: KeyIcon,
  },
];
