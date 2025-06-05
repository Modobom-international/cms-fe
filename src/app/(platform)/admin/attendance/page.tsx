import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttendanceReport } from "@/components/attendance/admin/attendance-report";
import { ComplaintsManagement } from "@/components/attendance/admin/complaints-management";

export default function AttendancePage() {
  const t = useTranslations("AttendancePage");

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
        </nav>

        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Attendance Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage employee attendance, view reports, and handle complaints
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Attendance Reports</TabsTrigger>
          <TabsTrigger value="complaints">Complaint Management</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <AttendanceReport />
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          <ComplaintsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
