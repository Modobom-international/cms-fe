import { Metadata } from "next";

import ActivityLogDataTable from "@/components/admin/activity-log/data-table";

export const metadata: Metadata = {
  title: "Activity Log",
  description: "View system activity logs and user actions",
};

export default function ActivityLogPage() {
  return (
    <div className="container py-8">
      <ActivityLogDataTable />
    </div>
  );
}
