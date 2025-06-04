"use client";

import { useAuth } from "@/providers/auth-provider";
import { ChevronRight, Home } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttendanceDashboard } from "@/components/attendance/employee/attendance-dashboard";
import { ComplaintsList } from "@/components/attendance/employee/complaints-list";

export default function EmployeeAttendancePage() {
  const { user, isLoadingUser } = useAuth();

  // Show loading state while user data is being fetched
  if (isLoadingUser) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <nav className="text-muted-foreground flex items-center gap-2 text-sm">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span>Employee</span>
            <ChevronRight className="h-4 w-4" />
            <span>Attendance</span>
          </nav>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Attendance
            </h1>
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  // Show error state if user is not available
  if (!user) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <nav className="text-muted-foreground flex items-center gap-2 text-sm">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span>Employee</span>
            <ChevronRight className="h-4 w-4" />
            <span>Attendance</span>
          </nav>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Attendance
            </h1>
            <p className="text-muted-foreground text-sm">
              Unable to load user data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Employee</span>
          <ChevronRight className="h-4 w-4" />
          <span>Attendance</span>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            My Attendance
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your daily attendance and manage any issues
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Attendance Dashboard</TabsTrigger>
          <TabsTrigger value="complaints">My Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AttendanceDashboard
            employeeId={parseInt(user.id)}
            employeeName={user.name}
          />
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          <ComplaintsList employeeId={parseInt(user.id)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
