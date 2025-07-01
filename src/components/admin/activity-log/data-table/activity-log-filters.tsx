"use client";

import React, { useState } from "react";

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
  const handleActionGroupChange = (groupKey: string, checked: boolean) => {
    if (checked) {
      onSelectedActionGroupsChange([...selectedActionGroups, groupKey]);
    } else {
      onSelectedActionGroupsChange(
        selectedActionGroups.filter((g) => g !== groupKey)
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

  // Apply filters function for consistency
  const applyFilters = () => {
    // The parent component already handles filter application
    // This function is used for consistency with the FilterPopover component
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search by email..."
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-10"
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
            {selectedActionGroups.length > 0 && (
              <FilterBadge
                label="Action Groups"
                filterValue={selectedActionGroups.join(",")}
                onClear={() => onSelectedActionGroupsChange([])}
              />
            )}
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
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onDatePresetSelect={onDatePresetSelect}
        />

        {/* Action Groups Filter */}
        <ActionGroupsFilter
          selectedActionGroups={selectedActionGroups}
          onChange={handleActionGroupChange}
          onApply={applyFilters}
        />

        {/* User Filter */}
        <UserFilter
          selectedUser={selectedUser}
          uniqueUsers={uniqueUsers}
          onChange={onSelectedUserChange}
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
}

function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onDatePresetSelect,
}: DateRangeFilterProps) {
  // Convert string dates to Date objects for the calendar
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  const dateRange = {
    from: fromDate,
    to: toDate,
  };

  // Date changes are handled directly in the Calendar onSelect callbacks

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

  // Apply filters function
  const applyFilters = () => {
    // The parent component already handles filter application
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
              <Button onClick={applyFilters} className="w-full">
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

  // Filter action groups based on search term
  const filteredActionGroups = Object.entries(ACTION_GROUPS).filter(
    ([_, group]) => group.label.toLowerCase().includes(searchTerm.toLowerCase())
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
        <PopoverContent className="w-72" align="start">
          <div className="px-3 pt-3 pb-2">
            <h3 className="text-foreground text-sm font-medium">
              Filter by Action Groups
            </h3>
          </div>

          {/* Search Input */}
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

          <ScrollArea className="h-60">
            <div className="space-y-3 p-3">
              {filteredActionGroups.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No action groups found
                  </p>
                </div>
              ) : (
                filteredActionGroups.map(([groupKey, group]) => (
                  <div key={groupKey} className="flex items-center space-x-2">
                    <Checkbox
                      id={groupKey}
                      checked={selectedActionGroups.includes(groupKey)}
                      onCheckedChange={(checked) =>
                        onChange(groupKey, checked === true)
                      }
                    />
                    <label
                      htmlFor={groupKey}
                      className="text-foreground cursor-pointer text-sm"
                    >
                      {group.label}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {group.actions.length} actions
                      </Badge>
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="border-border flex items-center justify-between border-t p-3">
            <Button onClick={onApply} className="w-full">
              Apply Filter
            </Button>
          </div>
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

  // Filter users based on search term
  const filteredUsers = uniqueUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <PopoverContent className="w-72" align="start">
          <div className="px-3 pt-3 pb-2">
            <h3 className="text-foreground text-sm font-medium">
              Filter by User
            </h3>
          </div>

          {/* Search Input */}
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

          <ScrollArea className="h-60">
            <div className="space-y-3 p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-users"
                  checked={selectedUser === "all"}
                  onCheckedChange={() => onChange("all")}
                />
                <label
                  htmlFor="all-users"
                  className="text-foreground cursor-pointer text-sm"
                >
                  All users
                </label>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No users found
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUser === user.id.toString()}
                      onCheckedChange={() => onChange(user.id.toString())}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-foreground cursor-pointer text-sm"
                    >
                      {user.email}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="border-border flex items-center justify-between border-t p-3">
            <Button onClick={onApply} className="w-full">
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

