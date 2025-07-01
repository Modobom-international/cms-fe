"use client";

import React from "react";

import { Activity, BarChart3, Clock, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityLogOverviewProps {
  totalActivities: number;
  uniqueUsers: number;
  actionGroupsCount: number;
  dateFrom?: string;
  dateTo?: string;
}

export function ActivityLogOverview({
  totalActivities,
  uniqueUsers,
  actionGroupsCount,
  dateFrom,
  dateTo,
}: ActivityLogOverviewProps) {
  const timePeriodText = () => {
    if (dateFrom && dateTo) {
      return `${dateFrom} to ${dateTo}`;
    }
    return "All time";
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Activities
          </CardTitle>
          <Activity className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActivities}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <User className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Action Groups</CardTitle>
          <BarChart3 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{actionGroupsCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Period</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            {timePeriodText()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
