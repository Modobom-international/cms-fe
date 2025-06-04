import { ChevronRight, Home } from "lucide-react";

import { AttendanceReport } from "@/components/attendance/admin/attendance-report";

export default function AttendanceReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Admin</span>
          <ChevronRight className="h-4 w-4" />
          <span>Attendance</span>
          <ChevronRight className="h-4 w-4" />
          <span>Reports</span>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Attendance Reports
          </h1>
          <p className="text-muted-foreground text-sm">
            View and analyze employee attendance data with detailed reports
          </p>
        </div>
      </div>

      {/* Main Content */}
      <AttendanceReport />
    </div>
  );
}
