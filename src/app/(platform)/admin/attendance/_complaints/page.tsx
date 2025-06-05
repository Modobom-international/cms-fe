import { ChevronRight, Home } from "lucide-react";

import { ComplaintsManagement } from "@/components/attendance/admin/complaints-management";

export default function AttendanceComplaintsPage() {
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
          <span>Complaints</span>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Attendance Complaints
          </h1>
          <p className="text-muted-foreground text-sm">
            Review and manage employee attendance complaints and issues
          </p>
        </div>
      </div>

      {/* Main Content */}
      <ComplaintsManagement />
    </div>
  );
}
