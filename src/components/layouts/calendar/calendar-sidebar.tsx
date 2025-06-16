"use client";

import * as React from "react";

import dynamic from "next/dynamic";

import { RiCheckLine } from "@remixicon/react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import { etiquettes } from "@/components/layouts/calendar/big-calendar";
import SidebarCalendar from "@/components/layouts/calendar/sidebar-calendar";
import { PlatformModeSwitcher } from "@/components/layouts/platform-mode-switcher";

const NavUser = dynamic(
  () => import("@/components/layouts/nav-user").then((mod) => mod.NavUser),
  {
    loading: () => <Skeleton className="h-12 w-full rounded-lg" />,
    ssr: false,
  }
);

export function CalendarSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { isColorVisible, toggleColorVisibility } = useCalendarContext();
  return (
    <Sidebar variant="sidebar" {...props} className="max-lg:p-3 lg:pe-1">
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <PlatformModeSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-0 pt-3">
        <SidebarGroup>
          <SidebarCalendar />
        </SidebarGroup>
        <SidebarGroup className="mt-3 border-t px-1 pt-4">
          <SidebarGroupLabel className="text-muted-foreground/65 uppercase">
            Calendars
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {etiquettes.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    className="has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative justify-between rounded-md has-focus-visible:ring-[3px] [&>svg]:size-auto"
                  >
                    <span>
                      <span className="flex items-center justify-between gap-3 font-medium">
                        <Checkbox
                          id={item.id}
                          className="peer sr-only"
                          checked={isColorVisible(item.color)}
                          onCheckedChange={() =>
                            toggleColorVisibility(item.color)
                          }
                        />
                        <RiCheckLine
                          className="peer-not-data-[state=checked]:invisible"
                          size={16}
                          aria-hidden="true"
                        />
                        <label
                          htmlFor={item.id}
                          className="peer-not-data-[state=checked]:text-muted-foreground/65 peer-not-data-[state=checked]:line-through after:absolute after:inset-0"
                        >
                          {item.name}
                        </label>
                      </span>
                      <span
                        className="size-1.5 rounded-full bg-(--event-color)"
                        style={
                          {
                            "--event-color": `var(--color-${item.color}-400)`,
                          } as React.CSSProperties
                        }
                      ></span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
