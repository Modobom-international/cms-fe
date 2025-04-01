"use client";

import { useState } from "react";

import { Calendar, Settings2Icon, SidebarIcon } from "lucide-react";

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
import { SearchForm } from "@/components/layouts/search-form";
import NotificationsButton from "@/components/notifications";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );

  const handlePrevMonth = () => {
    // This would normally update the calendar view
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(
      date.toLocaleString("default", { month: "long", year: "numeric" })
    );
  };

  const handleNextMonth = () => {
    // This would normally update the calendar view
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(
      date.toLocaleString("default", { month: "long", year: "numeric" })
    );
  };

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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                >
                  <Calendar className="text-muted-foreground h-[18px] w-[18px]" />
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

