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
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { CreateUploadDropdown } from "./create-upload-dropdown";

type IconType = LucideIcon | ComponentType<any>;

export function StorageMainNav({
  items,
  onCreateFolder,
  onUploadFile,
  onUploadFolder,
}: {
  items: {
    title: string;
    url: string;
    icon?: IconType;
  }[];
  onCreateFolder?: () => void;
  onUploadFile?: () => void;
  onUploadFolder?: () => void;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col">
        <CreateUploadDropdown
          onCreateFolder={onCreateFolder}
          onUploadFile={onUploadFile}
          onUploadFolder={onUploadFolder}
          className="mt-2 mb-4"
        />
        <SidebarGroupLabel>Storage</SidebarGroupLabel>
        {/* Navigation Menu */}
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

                    <span
                      className={cn(
                        "grow text-sm font-light transition-colors",
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

export const storageMainNav = [
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

