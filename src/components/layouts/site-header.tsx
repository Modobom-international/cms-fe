"use client";

import { Calendar, Settings2Icon, SidebarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

import AvatarButton from "@/components/avatars/avatar-button";
import { SearchForm } from "@/components/layouts/search-form";
import NotificationsButton from "@/components/notifications";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-3">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>

        <div className="flex items-center gap-3">
          <SearchForm className="w-[500px]" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Calendar className="text-muted-foreground h-[18px] w-[18px]" />
            </Button>

            <NotificationsButton />

            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings2Icon className="text-muted-foreground h-[18px] w-[18px]" />
            </Button>

            <AvatarButton />
          </div>
        </div>
      </div>
    </header>
  );
}
