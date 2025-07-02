"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Download,
  PlusCircle,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  ACTION_GROUPS,
  ActionGroupBadge,
} from "@/components/ui/badge/action-group-badge";
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

interface User {
  id: number;
  email: string;
}

interface ActivityLogFiltersProps {
  email: string;
  dateFrom: string;
  dateTo: string;
  selectedActionGroups: string[];
  selectedUsers: string[];
  selectedActions: string[];
  uniqueUsers: User[];
  onEmailChange: (email: string) => void;
  onDateFromChange: (dateFrom: string) => void;
  onDateToChange: (dateTo: string) => void;
  onSelectedActionGroupsChange: (groups: string[]) => void;
  onSelectedUsersChange: (userIds: string[]) => void;
  onSelectedActionsChange: (actions: string[]) => void;
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
  selectedUsers,
  selectedActions,
  uniqueUsers,
  onEmailChange,
  onDateFromChange,
  onDateToChange,
  onSelectedActionGroupsChange,
  onSelectedUsersChange,
  onSelectedActionsChange,
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
  const [localSelectedUsers, setLocalSelectedUsers] = useState(selectedUsers);
  const [localSelectedActions, setLocalSelectedActions] =
    useState(selectedActions);

  // Update local state when props change (when filters are applied or cleared)
  useEffect(() => {
    setLocalEmail(email);
    setLocalDateFrom(dateFrom || getTodayString());
    setLocalDateTo(dateTo || getTodayString());
    setLocalSelectedActionGroups(selectedActionGroups);
    setLocalSelectedUsers(selectedUsers);
    setLocalSelectedActions(selectedActions);
  }, [
    email,
    dateFrom,
    dateTo,
    selectedActionGroups,
    selectedUsers,
    selectedActions,
  ]);

  // Apply all filters at once
  const applyFilters = () => {
    onEmailChange(localEmail);
    onDateFromChange(localDateFrom || getTodayString());
    onDateToChange(localDateTo || getTodayString());
    onSelectedActionGroupsChange(localSelectedActionGroups);
    onSelectedUsersChange(localSelectedUsers);
    onSelectedActionsChange(localSelectedActions);
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
    selectedUsers.length > 0 ||
    selectedActions.length > 0
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
            {selectedActionGroups.length > 0 && (
              <FilterBadge
                label="Action Groups"
                filterValue={
                  selectedActionGroups.length > 1
                    ? `${selectedActionGroups.length} groups selected`
                    : ACTION_GROUPS[
                        selectedActionGroups[0] as keyof typeof ACTION_GROUPS
                      ]?.label || selectedActionGroups[0]
                }
                onClear={() => onSelectedActionGroupsChange([])}
              />
            )}
            {selectedActions.length > 0 && (
              <FilterBadge
                label="Actions"
                filterValue={
                  selectedActions.length > 1
                    ? `${selectedActions.length} actions selected`
                    : selectedActions[0]
                }
                onClear={() => onSelectedActionsChange([])}
              />
            )}
            {selectedUsers.length > 0 && (
              <FilterBadge
                label="Users"
                filterValue={
                  selectedUsers.length > 1
                    ? `${selectedUsers.length} users selected`
                    : uniqueUsers.find(
                        (u) => u.id.toString() === selectedUsers[0]
                      )?.email || selectedUsers[0]
                }
                onClear={() => onSelectedUsersChange([])}
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

        {/* Actions Tree Filter */}
        <ActionsTreeFilter
          selectedActions={localSelectedActions}
          onChange={setLocalSelectedActions}
          onApply={applyFilters}
        />

        {/* User Filter */}
        <UserFilter
          selectedUsers={localSelectedUsers}
          uniqueUsers={uniqueUsers}
          onChange={setLocalSelectedUsers}
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

interface ActionsTreeFilterProps {
  selectedActions: string[];
  onChange: (actions: string[]) => void;
  onApply: () => void;
}

function ActionsTreeFilter({
  selectedActions,
  onChange,
  onApply,
}: ActionsTreeFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Organize actions by groups
  const actionsByGroup = Object.entries(ACTION_GROUPS).map(([key, group]) => ({
    groupKey: key,
    groupLabel: group.label,
    actions: group.actions as readonly string[],
    icon: group.icon,
    color: group.color,
  }));

  // Filter actions based on search term
  const filteredActionsByGroup = actionsByGroup
    .map((group) => ({
      ...group,
      actions: group.actions.filter(
        (action) =>
          action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.groupLabel.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.actions.length > 0);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleActionChange = (action: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedActions, action]);
    } else {
      onChange(selectedActions.filter((a) => a !== action));
    }
  };

  const handleGroupChange = (
    groupActions: readonly string[],
    checked: boolean
  ) => {
    if (checked) {
      // Add all actions from this group
      const newActions = [...selectedActions];
      groupActions.forEach((action) => {
        if (!newActions.includes(action)) {
          newActions.push(action);
        }
      });
      onChange(newActions);
    } else {
      // Remove all actions from this group
      onChange(
        selectedActions.filter((action) => !groupActions.includes(action))
      );
    }
  };

  const isGroupChecked = (groupActions: readonly string[]) => {
    return (
      groupActions.length > 0 &&
      groupActions.every((action) => selectedActions.includes(action))
    );
  };

  const isGroupIndeterminate = (groupActions: readonly string[]) => {
    const selectedInGroup = groupActions.filter((action) =>
      selectedActions.includes(action)
    );
    return (
      selectedInGroup.length > 0 && selectedInGroup.length < groupActions.length
    );
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            Actions
            {selectedActions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {selectedActions.length}
              </Badge>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="px-3 pt-3 pb-2">
            <h3 className="text-foreground text-sm font-medium">
              Filter by Actions
            </h3>
          </div>

          {/* Search Input */}
          {actionsByGroup.length > 0 && (
            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-3">
              {actionsByGroup.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No actions available
                  </p>
                </div>
              ) : filteredActionsByGroup.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No actions found
                  </p>
                </div>
              ) : (
                filteredActionsByGroup.map((group) => {
                  const isExpanded = expandedGroups.has(group.groupKey);
                  const groupChecked = isGroupChecked(group.actions);
                  const groupIndeterminate = isGroupIndeterminate(
                    group.actions
                  );

                  return (
                    <div key={group.groupKey} className="space-y-1">
                      {/* Group Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group.groupKey}`}
                            checked={groupChecked}
                            ref={(el: any) => {
                              if (el) {
                                el.indeterminate = groupIndeterminate;
                              }
                            }}
                            onCheckedChange={(checked) =>
                              handleGroupChange(group.actions, checked === true)
                            }
                          />
                          <ActionGroupBadge
                            groupKey={group.groupKey}
                            size="sm"
                          />
                          <span className="text-muted-foreground text-xs">
                            ({group.actions.length})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleGroup(group.groupKey)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {/* Actions List */}
                      {isExpanded && (
                        <div className="ml-6 space-y-1">
                          {group.actions.map((action) => (
                            <div
                              key={action}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`action-${action}`}
                                checked={selectedActions.includes(action)}
                                onCheckedChange={(checked) =>
                                  handleActionChange(action, checked === true)
                                }
                              />
                              <label
                                htmlFor={`action-${action}`}
                                className="text-foreground cursor-pointer font-mono text-sm"
                              >
                                {action}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {actionsByGroup.length > 0 && (
            <div className="border-border flex items-center justify-between border-t p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChange([])}
                  disabled={selectedActions.length === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Expand all groups
                    setExpandedGroups(
                      new Set(actionsByGroup.map((g) => g.groupKey))
                    );
                  }}
                >
                  Expand All
                </Button>
              </div>
              <Button onClick={onApply} size="sm">
                Apply Filter
              </Button>
            </div>
          )}
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
                      className="text-foreground flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <ActionGroupBadge groupKey={option.value} size="sm" />
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
  selectedUsers: string[];
  uniqueUsers: User[];
  onChange: (userIds: string[]) => void;
  onApply: () => void;
}

function UserFilter({
  selectedUsers,
  uniqueUsers,
  onChange,
  onApply,
}: UserFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Convert users to options array (no "All users" option for multiple selection)
  const userOptions = uniqueUsers.map((user) => ({
    value: user.id.toString(),
    label: user.email,
  }));

  // Filter users based on search term
  const filteredUsers = userOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserChange = (userId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedUsers, userId]);
    } else {
      onChange(selectedUsers.filter((id) => id !== userId));
    }
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <span className="border-border text-muted-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2 py-0.5 text-xs font-medium transition-colors">
            <PlusCircle className="size-3" />
            Users
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="px-3 pt-3 pb-2">
            <h3 className="text-foreground text-sm font-medium">
              Filter by Users
            </h3>
          </div>

          {/* Search Input */}
          {userOptions.length > 0 && (
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
              {userOptions.length === 0 ? (
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
                      checked={selectedUsers.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleUserChange(option.value, checked === true)
                      }
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
          {userOptions.length > 0 && (
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
