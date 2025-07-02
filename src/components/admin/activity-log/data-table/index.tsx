"use client";

import React, { useMemo, useState } from "react";

import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";

import { IActivityLog } from "@/types/activity-log.type";

import { getCurrentTimezoneInfo } from "@/lib/utils";

import { useActivityLogExport, useGetActivityLogs } from "@/hooks/activity-log";
import { useDebounce } from "@/hooks/use-debounce";

import { Badge } from "@/components/ui/badge";
import { ActivityLogBadge } from "@/components/ui/badge/activity-log-badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

import { ActivityLogFilters } from "./activity-log-filters";
import { ActivityLogOverview } from "./activity-log-overview";

// Enhanced action type constants with grouping - matching API documentation (for use in table display)
const ACTION_GROUPS = {
  SITE_MANAGEMENT: {
    label: "Site Management",
    actions: ["create_site", "update_site", "delete_site"] as const,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
    icon: Activity,
  },
  PAGE_MANAGEMENT: {
    label: "Page Management",
    actions: ["create_page_exports", "update_pages", "delete_page"] as const,
    color: "bg-green-500/10 text-green-700 border-green-200",
    icon: FileText,
  },
  ATTENDANCE_MANAGEMENT: {
    label: "Attendance Management",
    actions: ["checkin", "checkout", "attendance_report"] as const,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
    icon: Clock,
  },
  ATTENDANCE_COMPLAINTS: {
    label: "Attendance Complaints",
    actions: [
      "create_complaint",
      "update_complaint",
      "resolve_complaint",
    ] as const,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
    icon: AlertCircle,
  },
  BOARD_MANAGEMENT: {
    label: "Board Management",
    actions: ["create_board", "update_board", "delete_board"] as const,
    color: "bg-teal-500/10 text-teal-700 border-teal-200",
    icon: BarChart3,
  },
  CLOUDFLARE_OPERATIONS: {
    label: "Cloudflare Operations",
    actions: [
      "create_project_cloudflare_page",
      "update_project_cloudflare_page",
      "create_deploy_cloudflare_page",
      "apply_page_domain_cloudflare_page",
      "deploy_export_cloudflare_page",
    ] as const,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
    icon: BarChart3,
  },
  DOMAIN_OPERATIONS: {
    label: "Domain Operations",
    actions: ["refresh_list_domain", "get_list_path_by_domain"] as const,
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
    icon: Clock,
  },
  GENERAL_OPERATIONS: {
    label: "General Operations",
    actions: [
      "access_view",
      "show_record",
      "get_permission_by_team",
      "detail_monitor_server",
    ] as const,
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
    icon: Eye,
  },
} as const;

// Helper function to render object in key-value format
const renderObjectDetails = (obj: any, indent = 0): React.ReactNode => {
  if (obj === null || obj === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (typeof obj !== "object") {
    return <span className="text-sm">{String(obj)}</span>;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return <span className="text-muted-foreground">[]</span>;
    }
    return (
      <div className="space-y-1">
        {obj.map((item, index) => (
          <div key={index} style={{ marginLeft: `${indent * 12}px` }}>
            <span className="text-muted-foreground text-xs">[{index}]:</span>{" "}
            {renderObjectDetails(item, indent + 1)}
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return <span className="text-muted-foreground">{}</span>;
  }

  return (
    <div className="space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} style={{ marginLeft: `${indent * 12}px` }}>
          <span className="text-muted-foreground text-xs font-medium">
            {key}:
          </span>{" "}
          {typeof value === "object" && value !== null ? (
            <div className="mt-1">{renderObjectDetails(value, indent + 1)}</div>
          ) : (
            <span className="text-sm">{String(value)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Helper function to get action group - now uses API response group_action field
const getActionGroup = (log: IActivityLog) => {
  // Use group_action from API response if available
  if (log.group_action) {
    const groupKey = log.group_action.toUpperCase().replace("_", "_");
    const group = ACTION_GROUPS[groupKey as keyof typeof ACTION_GROUPS];
    if (group) {
      return { key: groupKey, ...group };
    }
  }

  // Fallback to matching by action name for backward compatibility
  for (const [key, group] of Object.entries(ACTION_GROUPS)) {
    const actions = group.actions as unknown as string[];
    if (actions.includes(log.action)) {
      return { key, ...group };
    }
  }

  return {
    key: "OTHER",
    label: "Other",
    actions: [],
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
    icon: Activity,
  };
};

// Helper function to group activities by user and time
const groupActivitiesByUser = (activities: IActivityLog[]) => {
  const grouped = activities.reduce(
    (acc, activity) => {
      const userId = activity.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_email: activity.user_email,
          user_id: userId,
          activities: [],
          totalActions: 0,
          actionGroups: new Set(),
        };
      }
      acc[userId].activities.push(activity);
      acc[userId].totalActions++;
      acc[userId].actionGroups.add(getActionGroup(activity).key);
      return acc;
    },
    {} as Record<
      number,
      {
        user_email: string;
        user_id: number;
        activities: IActivityLog[];
        totalActions: number;
        actionGroups: Set<string>;
      }
    >
  );

  return Object.values(grouped);
};

export default function ActivityLogDataTable() {
  const t = useTranslations("ActivityLogPage.table");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const [viewMode, setViewMode] = useState<"table" | "timeline" | "grouped">(
    "table"
  );
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [email, setEmail] = useQueryState(
    "email",
    parseAsString.withDefault("")
  );
  const [dateFrom, setDateFrom] = useQueryState(
    "date_from",
    parseAsString.withDefault("")
  );
  const [dateTo, setDateTo] = useQueryState(
    "date_to",
    parseAsString.withDefault("")
  );
  const [selectedActionGroups, setSelectedActionGroups] = useQueryState(
    "action_groups",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [selectedUser, setSelectedUser] = useQueryState(
    "user_id",
    parseAsString.withDefault("all")
  );
  const [sortField, setSortField] = useQueryState(
    "sort_field",
    parseAsString.withDefault("created_at")
  );
  const [sortDirection, setSortDirection] = useQueryState(
    "sort_direction",
    parseAsString.withDefault("desc")
  );

  const debouncedSearch = useDebounce(email, 500);

  const {
    data: activityLogResponse,
    isFetching,
    isError,
    refetch,
  } = useGetActivityLogs(
    currentPage,
    pageSize,
    debouncedSearch,
    dateFrom,
    dateTo,
    selectedUser === "all" ? "" : selectedUser,
    selectedActionGroups,
    undefined, // actions - can be added later
    sortField,
    sortDirection
  );

  // Export functionality
  const { exportLogs } = useActivityLogExport();

  // Extract data from the response
  const activityLogData = useMemo(() => {
    return activityLogResponse?.data?.activities || ([] as IActivityLog[]);
  }, [activityLogResponse?.data?.activities]);

  const paginationInfo = activityLogResponse?.data?.pagination || {
    current_page: 1,
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
    per_page: 10,
  };
  const isDataEmpty = !activityLogData || activityLogData.length === 0;

  // Process data for different views
  const processedData = useMemo(() => {
    const filtered = activityLogData.filter((activity: IActivityLog) => {
      // Filter by action groups
      if (selectedActionGroups.length > 0) {
        const actionGroup = getActionGroup(activity);
        if (!selectedActionGroups.includes(actionGroup.key)) {
          return false;
        }
      }

      // Filter by user - no client-side filtering needed since API handles it
      // We only filter client-side for action groups
      return true;
    });

    return {
      activities: filtered,
      groupedByUser: groupActivitiesByUser(filtered),
      stats: {
        totalActivities: filtered.length,
        uniqueUsers: new Set(filtered.map((a: IActivityLog) => a.user_id)).size,
        actionGroups: Object.entries(
          filtered.reduce(
            (acc: Record<string, number>, activity: IActivityLog) => {
              const group = getActionGroup(activity);
              acc[group.key] = (acc[group.key] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          )
        ),
      },
    };
  }, [activityLogData, selectedActionGroups]);

  // Get unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const users = new Map();
    activityLogData.forEach((activity: IActivityLog) => {
      if (!users.has(activity.user_id)) {
        users.set(activity.user_id, {
          id: activity.user_id,
          email: activity.user_email,
        });
      }
    });
    return Array.from(users.values());
  }, [activityLogData]);

  // Handle next page navigation
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
  };

  // Handle previous page navigation
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Handle date preset selection
  const handleDatePreset = (preset: string) => {
    // Date range presets with getDates function
    const DATE_PRESETS = [
      {
        label: "Today",
        value: "today",
        getDates: () => ({ from: new Date(), to: new Date() }),
      },
      {
        label: "Yesterday",
        value: "yesterday",
        getDates: () => ({
          from: subDays(new Date(), 1),
          to: subDays(new Date(), 1),
        }),
      },
      {
        label: "Last 7 days",
        value: "week",
        getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }),
      },
      {
        label: "This week",
        value: "this_week",
        getDates: () => ({
          from: startOfWeek(new Date()),
          to: endOfWeek(new Date()),
        }),
      },
      {
        label: "Last 30 days",
        value: "month",
        getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }),
      },
      {
        label: "This month",
        value: "this_month",
        getDates: () => ({
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date()),
        }),
      },
    ];

    const selectedPreset = DATE_PRESETS.find((p) => p.value === preset);
    if (selectedPreset) {
      const { from, to } = selectedPreset.getDates();
      setDateFrom(format(from, "yyyy-MM-dd"));
      setDateTo(format(to, "yyyy-MM-dd"));
    }
  };

  // Handle row expansion
  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle column sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default descending order
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get sort icon for column header
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="text-muted-foreground ml-1 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="text-muted-foreground ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="text-muted-foreground ml-1 h-4 w-4" />
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setEmail("");
    setDateFrom("");
    setDateTo("");
    setSelectedActionGroups([]);
    setSelectedUser("all");
    setCurrentPage(1);
  };

  // Export functionality
  const handleExport = async (format: "csv" | "json" = "csv") => {
    try {
      await exportLogs({
        dateFrom,
        dateTo,
        userId: selectedUser === "all" ? undefined : selectedUser,
        actionGroups:
          selectedActionGroups.length > 0 ? selectedActionGroups : undefined,
        search: debouncedSearch || undefined,
        format,
        limit: 5000, // Export up to 5000 records as per API documentation
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <ActivityLogOverview
        totalActivities={processedData.stats.totalActivities}
        uniqueUsers={processedData.stats.uniqueUsers}
        actionGroupsCount={processedData.stats.actionGroups.length}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* Enhanced Filters Section */}
      <ActivityLogFilters
        email={email}
        dateFrom={dateFrom}
        dateTo={dateTo}
        selectedActionGroups={selectedActionGroups}
        selectedUser={selectedUser}
        uniqueUsers={uniqueUsers}
        onEmailChange={setEmail}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSelectedActionGroupsChange={setSelectedActionGroups}
        onSelectedUserChange={setSelectedUser}
        onDatePresetSelect={handleDatePreset}
        onClearFilters={clearFilters}
        onExport={handleExport}
      />

      {/* View Mode Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as typeof viewMode)}
      >
        <TabsList className="text-foreground h-auto w-full justify-start gap-2 rounded-none border-b bg-transparent px-0 py-1">
          <TabsTrigger
            value="table"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent data-[state=active]:text-primary relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Table View
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent data-[state=active]:text-primary relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Timeline View
          </TabsTrigger>
          <TabsTrigger
            value="grouped"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent data-[state=active]:text-primary relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Grouped by User
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive text-sm">
                  Failed to load activity logs
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : isDataEmpty ? (
            <EmptyTable />
          ) : (
            <div className="flex flex-col">
              <div className="relative w-full overflow-auto">
                <Table className="w-full">
                  <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                    <TableRow className="border-border hover:bg-muted/50 border-b">
                      <TableHead className="text-foreground w-[40px] py-3 font-medium"></TableHead>
                      <TableHead className="text-foreground w-[60px] py-3 font-medium">
                        ID
                      </TableHead>
                      <TableHead
                        className="text-foreground hover:bg-muted/50 w-[140px] cursor-pointer py-3 font-medium transition-colors"
                        onClick={() => handleSort("action")}
                      >
                        <div className="flex items-center">
                          Action
                          {getSortIcon("action")}
                        </div>
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        Group
                      </TableHead>
                      <TableHead className="text-foreground w-[180px] py-3 font-medium">
                        User
                      </TableHead>
                      <TableHead
                        className="text-foreground hover:bg-muted/50 w-[180px] cursor-pointer py-3 font-medium transition-colors"
                        onClick={() => handleSort("created_at")}
                      >
                        <div className="flex items-center">
                          Timestamp
                          {getSortIcon("created_at")}
                        </div>
                      </TableHead>
                      <TableHead className="text-foreground py-3 font-medium">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.activities.map((log: IActivityLog) => {
                      const isExpanded = expandedRows.has(log.id);
                      const actionGroup = getActionGroup(log);
                      const ActionGroupIcon = actionGroup.icon;

                      return (
                        <React.Fragment key={log.id}>
                          <TableRow className="border-border hover:bg-muted/50 group border-b text-xs transition-colors">
                            <TableCell className="py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRowExpansion(log.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-primary py-3 font-medium">
                              {log.id}
                            </TableCell>
                            <TableCell className="py-3">
                              <ActivityLogBadge action={log.action} />
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className={actionGroup.color}
                              >
                                <ActionGroupIcon className="mr-1 h-3 w-3" />
                                {actionGroup.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                  <User className="h-3 w-3" />
                                </div>
                                <span className="text-foreground text-sm font-medium">
                                  {log.user_email || "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.formatted_created_at ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-foreground text-xs font-medium">
                                    {getCurrentTimezoneInfo(
                                      log.formatted_created_at
                                    ).convertedTime || "—"}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    {getCurrentTimezoneInfo().timezoneFormat}
                                  </div>
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-foreground max-w-[200px] truncate py-3">
                              {log.description || "—"}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Activity Details - #{log.id}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Complete information about this activity
                                      log entry
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">
                                          Action
                                        </Label>
                                        <div className="mt-1">
                                          <ActivityLogBadge
                                            action={log.action}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">
                                          Group
                                        </Label>
                                        <div className="mt-1">
                                          <Badge
                                            variant="outline"
                                            className={actionGroup.color}
                                          >
                                            <ActionGroupIcon className="mr-1 h-3 w-3" />
                                            {actionGroup.label}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">
                                          User
                                        </Label>
                                        <p className="mt-1 text-sm">
                                          {log.user_email}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">
                                          Timestamp
                                        </Label>
                                        <p className="mt-1 text-sm">
                                          {log.formatted_created_at
                                            ? getCurrentTimezoneInfo(
                                                log.formatted_created_at
                                              ).convertedTime
                                            : "—"}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Description
                                      </Label>
                                      <p className="mt-1 text-sm">
                                        {log.description ||
                                          "No description available"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Full Details
                                      </Label>
                                      <div className="bg-muted mt-1 rounded-lg p-3">
                                        {log.details ? (
                                          renderObjectDetails(log.details)
                                        ) : (
                                          <span className="text-muted-foreground text-sm">
                                            No additional details available
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={7} className="py-4">
                                <div className="bg-muted/50 rounded-lg border p-4">
                                  <h4 className="mb-3 text-sm font-semibold">
                                    Extended Activity Details
                                  </h4>
                                  <div className="text-sm">
                                    {log.details ? (
                                      renderObjectDetails(log.details)
                                    ) : (
                                      <span className="text-muted-foreground">
                                        No details available
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="border-border bg-background dark:bg-card sticky bottom-0 mt-auto border-t">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Rows per page
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="border-border h-8 w-auto text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-sm">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-4 text-sm font-medium"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-4 text-sm font-medium"
                      onClick={handleNextPage}
                      disabled={currentPage === paginationInfo.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="border-border bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
                  <div>
                    Viewing {paginationInfo.from || 1}-
                    {paginationInfo.to ||
                      Math.min(pageSize, paginationInfo.total || 0)}{" "}
                    of {paginationInfo.total || 0} results
                  </div>
                  <div>
                    Page {currentPage} of {paginationInfo.last_page || 1}
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="my-2">
          {processedData.activities.length === 0 ? (
            <EmptyTable />
          ) : (
            <Timeline>
              {processedData.activities.map((log: IActivityLog) => {
                const actionGroup = getActionGroup(log);

                return (
                  <TimelineItem key={log.id} step={log.id}>
                    <TimelineHeader>
                      <TimelineSeparator />
                      <TimelineDate>
                        {log.details?.logged_at
                          ? format(
                              new Date(log.details.logged_at),
                              "MMM d, yyyy, h:mm:ss a"
                            )
                          : "Unknown Time"}
                      </TimelineDate>
                      <TimelineTitle>{actionGroup.label}</TimelineTitle>
                      <TimelineIndicator />
                    </TimelineHeader>
                    <TimelineContent>
                      <p className="text-muted-foreground">
                        {log.description || "No description provided."}
                      </p>
                      <div className="text-muted-foreground mt-2 text-xs">
                        <span className="text-foreground font-semibold">
                          {log.user_email}
                        </span>{" "}
                        performed action:{" "}
                        <span className="bg-muted rounded px-1.5 py-1 font-mono text-xs">
                          {log.action}
                        </span>
                      </div>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          )}
        </TabsContent>

        {/* Grouped View */}
        <TabsContent value="grouped" className="my-2">
          {processedData.groupedByUser.length === 0 ? (
            <EmptyTable />
          ) : (
            <div className="space-y-5">
              {processedData.groupedByUser.map((userGroup) => {
                const isExpanded = expandedUsers.has(userGroup.user_id);
                const toggleExpanded = () => {
                  setExpandedUsers((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(userGroup.user_id)) {
                      newSet.delete(userGroup.user_id);
                    } else {
                      newSet.add(userGroup.user_id);
                    }
                    return newSet;
                  });
                };

                return (
                  <div
                    key={userGroup.user_id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* User Header */}
                    <div className="dark:bg-gray-750 border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <User className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {userGroup.user_email}
                            </h4>
                            <div className="mt-1 flex items-center gap-2">
                              {Array.from(userGroup.actionGroups).map(
                                (groupKey) => {
                                  const group =
                                    ACTION_GROUPS[
                                      groupKey as keyof typeof ACTION_GROUPS
                                    ];
                                  if (!group) return null;
                                  const Icon = group.icon;
                                  return (
                                    <Badge
                                      key={groupKey}
                                      variant="outline"
                                      className={group.color}
                                    >
                                      <Icon className="mr-1 h-3 w-3" />
                                      {group.label}
                                    </Badge>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {userGroup.totalActions}
                          </div>
                          <div className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Activities
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Activities List */}
                    <Collapsible
                      open={isExpanded}
                      onOpenChange={toggleExpanded}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span className="text-sm font-medium">
                            {isExpanded
                              ? "Hide Activities"
                              : `Show ${userGroup.activities.length} Activities`}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="p-6 pt-0">
                          <div className="space-y-3">
                            {userGroup.activities.map((activity) => {
                              const actionGroup = getActionGroup(activity);
                              const ActionGroupIcon = actionGroup.icon;

                              return (
                                <div
                                  key={activity.id}
                                  className="group dark:hover:bg-gray-750 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-1 flex items-center gap-2">
                                        <ActivityLogBadge
                                          action={activity.action}
                                        />
                                        <Badge
                                          variant="outline"
                                          className={actionGroup.color}
                                        >
                                          <ActionGroupIcon className="mr-1 h-3 w-3" />
                                          {actionGroup.label}
                                        </Badge>
                                      </div>
                                      <div className="pl-4 text-sm text-gray-600 dark:text-gray-300">
                                        {activity.description ||
                                          "No description available"}
                                      </div>
                                    </div>
                                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      <span className="font-mono">
                                        {activity.details?.logged_at
                                          ? getCurrentTimezoneInfo(
                                              activity.details.logged_at
                                            ).convertedTime
                                          : "—"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Activity Details Dialog */}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-xs"
                                      >
                                        View Full Details
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Activity Details - #{activity.id}
                                        </DialogTitle>
                                        <DialogDescription>
                                          Complete information about this
                                          activity log entry
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Action
                                            </Label>
                                            <div className="mt-1">
                                              <ActivityLogBadge
                                                action={activity.action}
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Group
                                            </Label>
                                            <div className="mt-1">
                                              <Badge
                                                variant="outline"
                                                className={actionGroup.color}
                                              >
                                                <ActionGroupIcon className="mr-1 h-3 w-3" />
                                                {actionGroup.label}
                                              </Badge>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              User
                                            </Label>
                                            <p className="mt-1 text-sm">
                                              {activity.user_email}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium">
                                              Timestamp
                                            </Label>
                                            <p className="mt-1 text-sm">
                                              {activity.details?.logged_at
                                                ? getCurrentTimezoneInfo(
                                                    activity.details.logged_at
                                                  ).convertedTime
                                                : "—"}
                                            </p>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">
                                            Description
                                          </Label>
                                          <p className="mt-1 text-sm">
                                            {activity.description ||
                                              "No description available"}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">
                                            Full Details
                                          </Label>
                                          <div className="bg-muted mt-1 rounded-lg p-3">
                                            {activity.details ? (
                                              renderObjectDetails(
                                                activity.details
                                              )
                                            ) : (
                                              <span className="text-muted-foreground text-sm">
                                                No additional details available
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

