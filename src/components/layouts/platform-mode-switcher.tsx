"use client";

import * as React from "react";

import {
  IconBrush,
  IconCalendar,
  IconChecklist,
  IconDashboard,
  IconDatabase,
  IconSettings,
} from "@tabler/icons-react";
import { ChevronsUpDown, Home } from "lucide-react";

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
  },
  {
    name: "Platform Admin",
    logo: IconSettings,
    description: "Admin settings & metrics",
  },
  {
    name: "Manage Storage",
    logo: IconDatabase,
    description: "Database & file storage",
  },
  {
    name: "Studio",
    logo: IconBrush,
    description: "Build & design websites",
  },
  {
    name: "Task Tracking",
    logo: IconChecklist,
    description: "Projects & task management",
  },
  {
    name: "Calendar",
    logo: IconCalendar,
    description: "Schedule & events",
  },
];

export function PlatformModeSwitcher() {
  const { isMobile } = useSidebar();
  const [activeMode, setActiveMode] = React.useState(platformModes[0]);

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
                onClick={() => setActiveMode(mode)}
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
