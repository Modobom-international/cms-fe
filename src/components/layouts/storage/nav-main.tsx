"use client";

import { type ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Files,
  Home,
  Image,
  type LucideIcon,
  Trash2,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type IconType = LucideIcon | ComponentType<any>;

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
          {items.map((item) => {
            const isActive = pathname === item.url;
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
                    <div className="flex w-6 shrink-0 items-center justify-center">
                      {item.icon && (
                        <item.icon className={cn("size-4 transition-colors")} />
                      )}
                    </div>
                    <span className={cn("grow text-sm transition-colors")}>
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
