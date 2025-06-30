"use client";

import React, { useMemo, useState } from "react";

import { CalendarDate, parseDate } from "@internationalized/date";
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
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  PlusCircle,
  Search,
  User,
  X,
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

import { useGetActivityLogs } from "@/hooks/activity-log";
import { useDebounce } from "@/hooks/use-debounce";

import { Badge } from "@/components/ui/badge";
import { ActivityLogBadge } from "@/components/ui/badge/activity-log-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

// Enhanced action type constants with grouping
const ACTION_GROUPS = {
  SITE_MANAGEMENT: {
    label: "Site Management",
    actions: ["create_record", "update_record", "delete_record"] as const,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
    icon: Activity,
  },
  PAGE_MANAGEMENT: {
    label: "Page Management",
    actions: ["create_page_exports", "update_pages"] as const,
    color: "bg-green-500/10 text-green-700 border-green-200",
    icon: FileText,
  },
  CLOUDFLARE_OPS: {
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
  ACCESS_CONTROL: {
    label: "Access Control",
    actions: ["access_view", "show_record", "get_permission_by_team"] as const,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
    icon: Eye,
  },
  DOMAIN_OPS: {
    label: "Domain Operations",
    actions: ["refresh_list_domain", "get_list_path_by_domain"] as const,
    color: "bg-teal-500/10 text-teal-700 border-teal-200",
    icon: Clock,
  },
  MONITORING: {
    label: "Monitoring",
    actions: ["detail_monitor_server"] as const,
    color: "bg-red-500/10 text-red-700 border-red-200",
    icon: AlertCircle,
  },
} as const;

// Date range presets
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

// Helper function to get action group
const getActionGroup = (action: string) => {
  for (const [key, group] of Object.entries(ACTION_GROUPS)) {
    const actions = group.actions as unknown as string[];
    if (actions.includes(action)) {
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
      acc[userId].actionGroups.add(getActionGroup(activity.action).key);
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
  const [selectedActivityDetail, setSelectedActivityDetail] =
    useState<IActivityLog | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "timeline" | "grouped">(
    "table"
  );

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
    undefined // sortBy - can be added later
  );

  // Extract data from the response
  const activityLogData =
    activityLogResponse?.data?.activities || ([] as IActivityLog[]);
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
        const actionGroup = getActionGroup(activity.action);
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
              const group = getActionGroup(activity.action);
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
    const selectedPreset = DATE_PRESETS.find((p) => p.value === preset);
    if (selectedPreset) {
      const { from, to } = selectedPreset.getDates();
      setDateFrom(format(from, "yyyy-MM-dd"));
      setDateTo(format(to, "yyyy-MM-dd"));
    }
  };

  // Handle action group filter
  const handleActionGroupChange = (groupKey: string, checked: boolean) => {
    setSelectedActionGroups((prev) => {
      if (checked) {
        return [...prev, groupKey];
      } else {
        return prev.filter((g) => g !== groupKey);
      }
    });
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
  const handleExport = () => {
    // This would integrate with the export API endpoint from the documentation
    console.log("Export functionality to be implemented with API");
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.stats.totalActivities}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.stats.uniqueUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Groups</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.stats.actionGroups.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              {dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "All time"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Activity Filters</CardTitle>
              <CardDescription>
                Filter and search activity logs to track user actions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and User Filter */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Email</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  id="search"
                  placeholder="Search user emails..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range and Action Group Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                  {(dateFrom || dateTo) && (
                    <Badge variant="secondary" className="ml-2">
                      {dateFrom && dateTo
                        ? `${dateFrom} - ${dateTo}`
                        : dateFrom || dateTo}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Quick Presets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {DATE_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDatePreset(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Custom Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Action Group Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Action Groups
                  {selectedActionGroups.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedActionGroups.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-3">
                  <h4 className="font-medium">Filter by Action Groups</h4>
                  <ScrollArea className="max-h-60">
                    <div className="space-y-3">
                      {Object.entries(ACTION_GROUPS).map(([key, group]) => {
                        const Icon = group.icon;
                        return (
                          <div
                            key={key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={key}
                              checked={selectedActionGroups.includes(key)}
                              onCheckedChange={(checked) =>
                                handleActionGroupChange(key, checked === true)
                              }
                            />
                            <label
                              htmlFor={key}
                              className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                              <Icon className="h-4 w-4" />
                              {group.label}
                              <Badge variant="outline" className="text-xs">
                                {group.actions.length} actions
                              </Badge>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {(selectedActionGroups.length > 0 ||
            selectedUser ||
            dateFrom ||
            dateTo ||
            email) && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-2">
              <span className="text-muted-foreground text-sm">
                Active filters:
              </span>

              {selectedActionGroups.map((groupKey) => {
                const group =
                  ACTION_GROUPS[groupKey as keyof typeof ACTION_GROUPS];
                return (
                  <Badge
                    key={groupKey}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {group?.label || groupKey}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleActionGroupChange(groupKey, false)}
                    />
                  </Badge>
                );
              })}

              {selectedUser && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  User:{" "}
                  {
                    uniqueUsers.find((u) => u.id.toString() === selectedUser)
                      ?.email
                  }
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedUser("all")}
                  />
                </Badge>
              )}

              {(dateFrom || dateTo) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date:{" "}
                  {dateFrom && dateTo
                    ? `${dateFrom} - ${dateTo}`
                    : dateFrom || dateTo}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                  />
                </Badge>
              )}

              {email && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {email}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setEmail("")}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as typeof viewMode)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="grouped">Grouped by User</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
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
            <Card>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead className="w-[140px]">Action</TableHead>
                      <TableHead className="w-[120px]">Group</TableHead>
                      <TableHead className="w-[180px]">User</TableHead>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.activities.map((log: IActivityLog) => {
                      const isExpanded = expandedRows.has(log.id);
                      const actionGroup = getActionGroup(log.action);
                      const ActionGroupIcon = actionGroup.icon;

                      return (
                        <React.Fragment key={log.id}>
                          <TableRow className="hover:bg-muted/50">
                            <TableCell>
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
                            <TableCell className="font-medium">
                              {log.id}
                            </TableCell>
                            <TableCell>
                              <ActivityLogBadge action={log.action} />
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={actionGroup.color}
                              >
                                <ActionGroupIcon className="mr-1 h-3 w-3" />
                                {actionGroup.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                  <User className="h-3 w-3" />
                                </div>
                                <span className="text-sm">
                                  {log.user_email || "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.details && log.details.logged_at ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-xs font-medium">
                                    {getCurrentTimezoneInfo(
                                      log.details.logged_at
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
                            <TableCell className="max-w-[200px] truncate">
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
                                          {log.details?.logged_at
                                            ? getCurrentTimezoneInfo(
                                                log.details.logged_at
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
                              <TableCell colSpan={8} className="py-4">
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
              <div className="border-t">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Rows per page
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-auto text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === paginationInfo.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
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
            </Card>
          )}
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>
                Chronological view of user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.activities.length === 0 ? (
                <EmptyTable />
              ) : (
                <div className="space-y-4">
                  {processedData.activities.map(
                    (log: IActivityLog, index: number) => {
                      const actionGroup = getActionGroup(log.action);
                      const ActionGroupIcon = actionGroup.icon;

                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 border-b pb-4 last:border-b-0"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`rounded-full p-2 ${actionGroup.color}`}
                            >
                              <ActionGroupIcon className="h-4 w-4" />
                            </div>
                            {index !== processedData.activities.length - 1 && (
                              <div className="bg-border mt-2 h-8 w-px" />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ActivityLogBadge action={log.action} />
                                <Badge
                                  variant="outline"
                                  className={actionGroup.color}
                                >
                                  {actionGroup.label}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {log.details?.logged_at
                                  ? getCurrentTimezoneInfo(
                                      log.details.logged_at
                                    ).convertedTime
                                  : "—"}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                <User className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium">
                                {log.user_email}
                              </span>
                            </div>

                            <p className="text-muted-foreground text-sm">
                              {log.description || "No description available"}
                            </p>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Activity Details - #{log.id}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {log.details ? (
                                    renderObjectDetails(log.details)
                                  ) : (
                                    <span className="text-muted-foreground">
                                      No additional details available
                                    </span>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grouped View */}
        <TabsContent value="grouped" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Activities Grouped by User
              </CardTitle>
              <CardDescription>
                View all activities organized by user for better tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.groupedByUser.length === 0 ? (
                <EmptyTable />
              ) : (
                <div className="space-y-6">
                  {processedData.groupedByUser.map((userGroup) => (
                    <Card key={userGroup.user_id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {userGroup.user_email}
                              </CardTitle>
                              <CardDescription>
                                {userGroup.totalActions} activities across{" "}
                                {userGroup.actionGroups.size} groups
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {userGroup.activities.slice(0, 5).map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center justify-between border-b py-2 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <ActivityLogBadge action={activity.action} />
                                <span className="text-muted-foreground text-sm">
                                  {activity.description || "No description"}
                                </span>
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {activity.details?.logged_at
                                  ? getCurrentTimezoneInfo(
                                      activity.details.logged_at
                                    ).convertedTime
                                  : "—"}
                              </div>
                            </div>
                          ))}
                          {userGroup.activities.length > 5 && (
                            <div className="pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                              >
                                View all {userGroup.activities.length}{" "}
                                activities
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
