import React from "react";

import { Activity, ChevronRight, Globe, Home, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PushSystemDataTable from "@/components/admin/push-system/data-table";

export default function Page() {
  return (
    <>
      {/* Header Section */}
      <div className="border-border mb-8 border-b pb-6">
        {/* Breadcrumbs */}
        <div className="text-muted-foreground mb-4 flex items-center text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="mx-2 h-4 w-4" />
          <span>Push System</span>
        </div>

        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Push System</h1>
            <p className="text-muted-foreground mt-1">
              Managing and monitoring of the push notification system
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">739,157</div>
            <p className="text-muted-foreground text-xs">
              Across all countries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37</div>
            <p className="text-muted-foreground text-xs">
              Users active in the last 24 hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-muted-foreground text-xs">Active regions</p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <div>
        <PushSystemDataTable />
      </div>
    </>
  );
}
