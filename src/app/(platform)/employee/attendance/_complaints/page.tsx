"use client";

import { useAuth } from "@/providers/auth-provider";
import { ChevronRight, Home } from "lucide-react";

import { ComplaintsList } from "@/components/attendance/employee/complaints-list";

export default function EmployeeComplaintsPage() {
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
            <ChevronRight className="h-4 w-4" />
            <span>Complaints</span>
          </nav>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Attendance Complaints
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
            <ChevronRight className="h-4 w-4" />
            <span>Complaints</span>
          </nav>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Attendance Complaints
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
          <ChevronRight className="h-4 w-4" />
          <span>Complaints</span>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            My Attendance Complaints
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage your attendance complaints and issues
          </p>
        </div>
      </div>

      {/* Main Content */}
      <ComplaintsList employeeId={parseInt(user.id)} />
    </div>
  );
}
