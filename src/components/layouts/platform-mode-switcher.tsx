"use client";

import * as React from "react";

import { usePathname } from "next/navigation";

import {
  IconCalendar,
  IconChecklist,
  IconSettings,
  IconWorldWww,
} from "@tabler/icons-react";
import { ChevronsUpDown, Home } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const platformModes = [
  {
    name: "My Dashboard",
    logo: Home,
    description: "Profile, tasks & attendance",
    route: "/dashboard",
    pathPattern: /^\/dashboard/,
  },
  {
    name: "Platform Admin",
    logo: IconSettings,
    description: "Admin settings & metrics",
    route: "/admin",
    pathPattern: /^\/admin/,
  },
  // {
  //   name: "Manage Storage",
  //   logo: IconDatabase,
  //   description: "Database & file storage",
  //   route: "/storage",
  //   pathPattern: /^\/storage/,
  // },
  {
    name: "Ads Sites",
    logo: IconWorldWww,
    description: "Manage domains & sites",
    route: "/studio",
    pathPattern: /^\/studio/,
  },
  {
    name: "Task Tracking",
    logo: IconChecklist,
    description: "Projects & task management",
    route: "/tasks",
    pathPattern: /^\/workspaces/,
  },
  {
    name: "Calendar",
    logo: IconCalendar,
    description: "Schedule & events",
    route: "/calendar",
    pathPattern: /^\/calendar/,
  },
];

export function PlatformModeSwitcher() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  // Determine active mode based on current pathname
  const activeMode = React.useMemo(() => {
    const currentMode = platformModes.find((mode) =>
      mode.pathPattern.test(pathname)
    );
    return currentMode || platformModes[0]; // Default to first mode if no match
  }, [pathname]);

  const handleModeSelect = (mode: (typeof platformModes)[0]) => {
    if (mode.route !== activeMode.route) {
      router.push(mode.route);
    }
  };

  if (!activeMode) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeMode.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeMode.name}
                </span>
                <span className="truncate text-xs">
                  {activeMode.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Platform Modes
            </DropdownMenuLabel>
            {platformModes.map((mode, index) => (
              <DropdownMenuItem
                key={mode.name}
                onClick={() => handleModeSelect(mode)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <mode.logo className="size-4 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{mode.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {mode.description}
                  </span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
