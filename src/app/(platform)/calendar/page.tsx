import type { Metadata } from "next";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import BigCalendar from "@/components/layouts/calendar/big-calendar";
import { CalendarSidebar } from "@/components/layouts/calendar/calendar-sidebar";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function Page() {
  return (
    <CalendarProvider>
      <SidebarProvider>
        <CalendarSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
            <BigCalendar />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CalendarProvider>
  );
}
