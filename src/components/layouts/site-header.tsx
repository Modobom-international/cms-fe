"use client";

import { useAuth } from "@/providers/auth-provider";
import { Calendar, SidebarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

import AvatarButton from "@/components/avatars/avatar-button";
import CalendarSample from "@/components/calendar/calendar-sample";
import NotificationsButton from "@/components/notifications";

import LanguageSwitcher from "../i18n/language-switcher";
import { Skeleton } from "../ui/skeleton";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full items-center border-b">
      <div className="flex w-full items-center justify-between gap-2 px-4">
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
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Calendar size={16} aria-hidden="true" />
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                    3
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="end"
                showArrow={true}
              >
                {/* Calendar Header */}
                <div className="border-b p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Calendar</div>
                  </div>
                </div>

                {/* Calendar Content */}
                <div className="max-h-[600px] w-[800px] overflow-auto">
                  <CalendarSample />
                </div>

                {/* Calendar Footer */}
                <div className="text-muted-foreground flex items-center justify-between border-t p-2 text-xs">
                  <div>Today: {new Date().toLocaleDateString()}</div>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    View all events
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {user && user.email ? (
              <NotificationsButton email={user.email} />
            ) : (
              <Skeleton className="h-6 w-6 rounded-lg" />
            )}

            <LanguageSwitcher />

            <AvatarButton />
          </div>
        </div>
      </div>
    </header>
  );
}

