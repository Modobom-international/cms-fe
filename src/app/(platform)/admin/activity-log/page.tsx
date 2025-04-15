import { Metadata } from "next";

import { ChevronRight, Home } from "lucide-react";

import ActivityLogDataTable from "@/components/admin/activity-log/data-table";

export const metadata: Metadata = {
  title: "Activity Log",
  description: "View system activity logs and user actions",
};

export default function ActivityLogPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Activity Log</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Activity Log
            </h1>
            <p className="text-muted-foreground text-sm">
              View system activity logs and user actions
            </p>
          </div>
        </div>
      </div>

      <div>
        <ActivityLogDataTable />
      </div>
    </div>
  );
}
