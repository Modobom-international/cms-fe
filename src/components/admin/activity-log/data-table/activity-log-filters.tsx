"use client";

import React, { useEffect, useState } from "react";

import { format } from "date-fns";
import { CalendarIcon, Download, PlusCircle, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Enhanced action type constants with grouping
const ACTION_GROUPS = {
  SITE_MANAGEMENT: {
    label: "Site Management",
    actions: ["create_record", "update_record", "delete_record"] as const,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
    icon: "Activity",
  },
  PAGE_MANAGEMENT: {
    label: "Page Management",
    actions: ["create_page_exports", "update_pages"] as const,
    color: "bg-green-500/10 text-green-700 border-green-200",
    icon: "FileText",
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
    icon: "BarChart3",
  },
  ACCESS_CONTROL: {
    label: "Access Control",
    actions: ["access_view", "show_record", "get_permission_by_team"] as const,
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
    icon: "Eye",
  },
  DOMAIN_OPS: {
    label: "Domain Operations",
    actions: ["refresh_list_domain", "get_list_path_by_domain"] as const,
    color: "bg-teal-500/10 text-teal-700 border-teal-200",
    icon: "Clock",
  },
  MONITORING: {
    label: "Monitoring",
    actions: ["detail_monitor_server"] as const,
    color: "bg-red-500/10 text-red-700 border-red-200",
    icon: "AlertCircle",
  },
} as const;

// Date range presets are handled directly in the DateRangeFilter component

interface User {
  id: number;
  email: string;
}

interface ActivityLogFiltersProps {
  email: string;
  dateFrom: string;
  dateTo: string;
  selectedActionGroups: string[];
  selectedUser: string;
  uniqueUsers: User[];
  onEmailChange: (email: string) => void;
  onDateFromChange: (dateFrom: string) => void;
  onDateToChange: (dateTo: string) => void;
  onSelectedActionGroupsChange: (groups: string[]) => void;
  onSelectedUserChange: (userId: string) => void;
  onDatePresetSelect: (preset: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
}

interface FilterBadgeProps {
  label: string;
  filterValue: string;
  onClear: () => void;
}

function FilterBadge({ label, filterValue, onClear }: FilterBadgeProps) {
  const values = filterValue.split(",").filter(Boolean);
  const displayText =
    values.length > 3 ? `${values.length} selected` : values.join(", ");

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
    >
      <span className="font-medium text-purple-600 dark:text-purple-400">
        {label}:
      </span>
      <span className="max-w-32 truncate">{displayText}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 rounded-full p-0 text-purple-500 transition-colors hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-800 dark:hover:text-purple-300"
        onClick={onClear}
      >
        <X className="h-2.5 w-2.5" />
        <span className="sr-only">Remove {label} filter</span>
      </Button>
    </Badge>
  );
}

export function ActivityLogFilters({
  email,
  dateFrom,
  dateTo,
  selectedActionGroups,
  selectedUser,
  uniqueUsers,
  onEmailChange,
  onDateFromChange,
  onDateToChange,
  onSelectedActionGroupsChange,
  onSelectedUserChange,
  onDatePresetSelect,
  onClearFilters,
  onExport,
}: ActivityLogFiltersProps) {
  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => format(new Date(), "yyyy-MM-dd");

  // Local state for temporary filter values with today as default for date range
  const [localEmail, setLocalEmail] = useState(email);
  const [localDateFrom, setLocalDateFrom] = useState(
    dateFrom || getTodayString()
  );
  const [localDateTo, setLocalDateTo] = useState(dateTo || getTodayString());
  const [localSelectedActionGroups, setLocalSelectedActionGroups] =
    useState(selectedActionGroups);
  const [localSelectedUser, setLocalSelectedUser] = useState(selectedUser);

  // Update local state when props change (when filters are applied or cleared)
  useEffect(() => {
    setLocalEmail(email);
    setLocalDateFrom(dateFrom || getTodayString());
    setLocalDateTo(dateTo || getTodayString());
    setLocalSelectedActionGroups(selectedActionGroups);
    setLocalSelectedUser(selectedUser);
  }, [email, dateFrom, dateTo, selectedActionGroups, selectedUser]);

  // Apply all filters at once
  const applyFilters = () => {
    onEmailChange(localEmail);
    onDateFromChange(localDateFrom || getTodayString());
    onDateToChange(localDateTo || getTodayString());
    onSelectedActionGroupsChange(localSelectedActionGroups);
    onSelectedUserChange(localSelectedUser);
  };

  const handleActionGroupChange = (groupKey: string, checked: boolean) => {
    if (checked) {
      setLocalSelectedActionGroups([...localSelectedActionGroups, groupKey]);
    } else {
      setLocalSelectedActionGroups(
        localSelectedActionGroups.filter((g) => g !== groupKey)
      );
    }
  };

  const clearDateRange = () => {
    onDateFromChange("");
    onDateToChange("");
  };

  // Check if any filters are applied
  const hasAppliedFilters = !!(
    email ||
    dateFrom ||
    dateTo ||
    selectedActionGroups.length > 0 ||
    selectedUser !== "all"
  );

  // Handle date preset selection for local state
  const handleLocalDatePreset = (preset: string) => {
    const today = new Date();

    switch (preset) {
      case "today":
        setLocalDateFrom(format(today, "yyyy-MM-dd"));
        setLocalDateTo(format(today, "yyyy-MM-dd"));
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setLocalDateFrom(format(yesterday, "yyyy-MM-dd"));
        setLocalDateTo(format(yesterday, "yyyy-MM-dd"));
        break;
      case "week":
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        setLocalDateFrom(format(lastWeek, "yyyy-MM-dd"));
        setLocalDateTo(format(today, "yyyy-MM-dd"));
        break;
      case "month":
        const lastMonth = new Date(today);
        lastMonth.setDate(lastMonth.getDate() - 30);
        setLocalDateFrom(format(lastMonth, "yyyy-MM-dd"));
        setLocalDateTo(format(today, "yyyy-MM-dd"));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search by email..."
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
          />
        </div>
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Applied Filters Display */}
      {hasAppliedFilters && (
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(dateFrom || dateTo) && (
              <FilterBadge
                label="Date Range"
                filterValue={`${dateFrom || ""} - ${dateTo || ""}`}
                onClear={clearDateRange}
              />
            )}
            {selectedActionGroups.map((groupKey) => (
              <FilterBadge
                key={groupKey}
                label="Action Group"
                filterValue={
                  ACTION_GROUPS[groupKey as keyof typeof ACTION_GROUPS]
                    ?.label || groupKey
                }
                onClear={() =>
                  onSelectedActionGroupsChange(
                    selectedActionGroups.filter((key) => key !== groupKey)
                  )
                }
              />
            ))}
            {selectedUser !== "all" && (
              <FilterBadge
                label="User"
                filterValue={
                  uniqueUsers.find((u) => u.id.toString() === selectedUser)
                    ?.email || ""
                }
                onClear={() => onSelectedUserChange("all")}
              />
            )}
            {email && (
              <FilterBadge
                label="Email"
                filterValue={email}
                onClear={() => onEmailChange("")}
              />
            )}
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground h-7 px-3 text-xs font-medium transition-all duration-200"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tags Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Filter */}
        <DateRangeFilter
          dateFrom={localDateFrom}
          dateTo={localDateTo}
          onDateFromChange={setLocalDateFrom}
          onDateToChange={setLocalDateTo}
          onDatePresetSelect={handleLocalDatePreset}
          onApply={applyFilters}
        />

        {/* Action Groups Filter */}
        <ActionGroupsFilter
          selectedActionGroups={localSelectedActionGroups}
          onChange={handleActionGroupChange}
          onApply={applyFilters}
        />

        {/* User Filter */}
        <UserFilter
          selectedUser={localSelectedUser}
          uniqueUsers={uniqueUsers}
          onChange={setLocalSelectedUser}
          onApply={applyFilters}
        />
      </div>
    </div>
  );
}

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onDatePresetSelect: (preset: string) => void;
  onApply: () => void;
}

function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onDatePresetSelect,
  onApply,
}: DateRangeFilterProps) {
  // Convert string dates to Date objects for the calendar
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  const dateRange = {
    from: fromDate,
    to: toDate,
  };

  // Helper functions to check if a quick range is currently active
  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = () => {
    const today = new Date();
    return isSameDay(dateRange.from, today) && isSameDay(dateRange.to, today);
  };

  const isYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      isSameDay(dateRange.from, yesterday) && isSameDay(dateRange.to, yesterday)
    );
  };

  const isLast7Days = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    return (
      isSameDay(dateRange.from, lastWeek) && isSameDay(dateRange.to, today)
    );
  };

  const isLast30Days = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    return (
      isSameDay(dateRange.from, lastMonth) && isSameDay(dateRange.to, today)
    );
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            Date Range
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-foreground text-sm font-medium">
                Date Range Filter
              </h3>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {/* From Date */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs">
                      From Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            format(dateRange.from, "MMM d, yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from || undefined}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              onDateFromChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* To Date */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs">
                      To Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? (
                            format(dateRange.to, "MMM d, yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to || undefined}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              onDateToChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          disabled={(date: Date) =>
                            date > new Date() ||
                            date < new Date("1900-01-01") ||
                            (dateRange.from ? date < dateRange.from : false)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quick Date Range Options */}
                <div className="space-y-2">
                  <label className="text-muted-foreground text-xs">
                    Quick Ranges
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant={isToday() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isToday()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => onDatePresetSelect("today")}
                    >
                      Today
                    </Button>
                    <Button
                      variant={isYesterday() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isYesterday()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => onDatePresetSelect("yesterday")}
                    >
                      Yesterday
                    </Button>
                    <Button
                      variant={isLast7Days() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isLast7Days()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => onDatePresetSelect("week")}
                    >
                      Last 7 Days
                    </Button>
                    <Button
                      variant={isLast30Days() ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "justify-start text-xs transition-all",
                        isLast30Days()
                          ? "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
                          : "hover:bg-muted"
                      )}
                      onClick={() => onDatePresetSelect("month")}
                    >
                      Last 30 Days
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <Button onClick={onApply} className="w-full">
                Apply Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ActionGroupsFilterProps {
  selectedActionGroups: string[];
  onChange: (groupKey: string, checked: boolean) => void;
  onApply: () => void;
}

function ActionGroupsFilter({
  selectedActionGroups,
  onChange,
  onApply,
}: ActionGroupsFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Convert ACTION_GROUPS to options array
  const actionGroupOptions = Object.entries(ACTION_GROUPS).map(
    ([key, group]) => ({
      value: key,
      label: group.label,
    })
  );

  // Filter action groups based on search term
  const filteredActionGroups = actionGroupOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            Action Groups
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="px-3 pt-3 pb-2">
            <h3 className="text-foreground text-sm font-medium">
              Filter by Action Groups
            </h3>
          </div>

          {/* Search Input */}
          {actionGroupOptions.length > 0 && (
            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search action groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
          )}

          <ScrollArea className="h-60">
            <div className="space-y-3 p-3">
              {actionGroupOptions.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No action groups available
                  </p>
                </div>
              ) : filteredActionGroups.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No action groups found
                  </p>
                </div>
              ) : (
                filteredActionGroups.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={option.value}
                      checked={selectedActionGroups.includes(option.value)}
                      onCheckedChange={(checked) =>
                        onChange(option.value, checked === true)
                      }
                    />
                    <label
                      htmlFor={option.value}
                      className="text-foreground cursor-pointer text-sm"
                    >
                      {option.label}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {actionGroupOptions.length > 0 && (
            <div className="border-border flex items-center justify-between border-t p-3">
              <Button onClick={onApply} className="w-full">
                Apply Filter
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface UserFilterProps {
  selectedUser: string;
  uniqueUsers: User[];
  onChange: (userId: string) => void;
  onApply: () => void;
}

function UserFilter({
  selectedUser,
  uniqueUsers,
  onChange,
  onApply,
}: UserFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Convert users to options array including "All users" option
  const userOptions = [
    { value: "all", label: "All users" },
    ...uniqueUsers.map((user) => ({
      value: user.id.toString(),
      label: user.email,
    })),
  ];

  // Filter users based on search term
  const filteredUsers = userOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            User
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="px-3 pt-3 pb-2">
            <h3 className="text-foreground text-sm font-medium">
              Filter by User
            </h3>
          </div>

          {/* Search Input */}
          {userOptions.length > 1 && (
            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
          )}

          <ScrollArea className="h-60">
            <div className="space-y-3 p-3">
              {userOptions.length <= 1 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No users available
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No users found
                  </p>
                </div>
              ) : (
                filteredUsers.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`user-${option.value}`}
                      checked={selectedUser === option.value}
                      onCheckedChange={() => onChange(option.value)}
                    />
                    <label
                      htmlFor={`user-${option.value}`}
                      className="text-foreground cursor-pointer text-sm"
                    >
                      {option.label}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {userOptions.length > 1 && (
            <div className="border-border flex items-center justify-between border-t p-3">
              <Button onClick={onApply} className="w-full">
                Apply Filter
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
