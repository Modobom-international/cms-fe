"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: any;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground mb-2 px-3 text-xs font-medium">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            (item.url === "/admin" && pathname === "/admin") ||
            (item.url !== "/admin" && pathname?.startsWith(item.url));

          const hasActiveChild = item.items?.some(
            (subItem) => pathname === subItem.url
          );

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive || hasActiveChild || item.isActive}
            >
              <SidebarMenuItem className="my-0.5">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "text-muted-foreground relative w-full rounded-md",
                    "hover:text-primary hover:bg-[#f7f5fd]",
                    isActive &&
                      "text-primary before:bg-primary bg-[#f7f5fd] font-medium before:absolute before:top-1/2 before:left-0 before:h-3/5 before:w-0.5 before:-translate-y-1/2 before:rounded-full"
                  )}
                >
                  <Link href={item.url} className="flex items-center py-2">
                    <item.icon
                      className={cn(
                        "mr-3 ml-3 size-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction
                        className={cn(
                          "hover:bg-accent/50 rounded-md transition-transform duration-200",
                          "data-[state=open]:rotate-90"
                        )}
                      >
                        <ChevronRight className="text-muted-foreground size-3.5" />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-collapsible-down">
                      <SidebarMenuSub className="border-l-border my-1 ml-2 space-y-1 border-l-[1px] pl-10">
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url;

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "w-full rounded-md text-xs transition-all duration-200",
                                  "hover:bg-accent/50 hover:text-primary",
                                  isSubActive &&
                                    "bg-accent/60 text-primary before:bg-primary font-medium before:absolute before:top-1/2 before:left-[-9px] before:h-2 before:w-0.5 before:-translate-y-1/2 before:rounded-full"
                                )}
                              >
                                <Link
                                  href={subItem.url}
                                  className="w-full py-1.5"
                                >
                                  <span
                                    className={cn(
                                      "text-sm",
                                      isSubActive
                                        ? "text-primary"
                                        : "text-foreground"
                                    )}
                                  >
                                    {subItem.title}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

