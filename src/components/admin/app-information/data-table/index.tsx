"use client";

import { useMemo, useState } from "react";

import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { formatDateTime } from "@/lib/utils";

import { useDebounce } from "@/hooks/use-debounce";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/inputs/search-input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

type AppInformationItem = {
  id: string;
  request_id: string;
  app_name: string;
  app_id: string;
  app_version: string;
  os_name: string;
  os_version: string;
  event_name: string;
  event_value: string;
  category: string;
  timestamp: string;
};

// Mock data
const mockAppInformation: AppInformationItem[] = [
  {
    id: "1",
    request_id: "req_001_2024",
    app_name: "Modobom App",
    app_id: "com.modobom.main",
    app_version: "2.1.4",
    os_name: "Android",
    os_version: "13",
    event_name: "user_login",
    event_value: "successful",
    category: "authentication",
    timestamp: "2024-01-15T08:30:00Z",
  },
  {
    id: "2",
    request_id: "req_002_2024",
    app_name: "Modobom Pro",
    app_id: "com.modobom.pro",
    app_version: "1.8.2",
    os_name: "iOS",
    os_version: "17.2",
    event_name: "purchase_completed",
    event_value: "premium_subscription",
    category: "commerce",
    timestamp: "2024-01-15T10:15:00Z",
  },
  {
    id: "3",
    request_id: "req_003_2024",
    app_name: "Modobom Lite",
    app_id: "com.modobom.lite",
    app_version: "3.0.1",
    os_name: "Android",
    os_version: "12",
    event_name: "screen_view",
    event_value: "dashboard",
    category: "navigation",
    timestamp: "2024-01-15T14:22:00Z",
  },
  {
    id: "4",
    request_id: "req_004_2024",
    app_name: "Modobom App",
    app_id: "com.modobom.main",
    app_version: "2.1.3",
    os_name: "iOS",
    os_version: "16.7",
    event_name: "error_occurred",
    event_value: "network_timeout",
    category: "error",
    timestamp: "2024-01-15T16:45:00Z",
  },
  {
    id: "5",
    request_id: "req_005_2024",
    app_name: "Modobom Pro",
    app_id: "com.modobom.pro",
    app_version: "1.8.1",
    os_name: "Android",
    os_version: "14",
    event_name: "feature_used",
    event_value: "export_data",
    category: "feature",
    timestamp: "2024-01-15T18:30:00Z",
  },
  {
    id: "6",
    request_id: "req_006_2024",
    app_name: "Modobom Lite",
    app_id: "com.modobom.lite",
    app_version: "3.0.0",
    os_name: "iOS",
    os_version: "17.1",
    event_name: "notification_clicked",
    event_value: "daily_reminder",
    category: "engagement",
    timestamp: "2024-01-15T20:10:00Z",
  },
  {
    id: "7",
    request_id: "req_007_2024",
    app_name: "Modobom App",
    app_id: "com.modobom.main",
    app_version: "2.1.4",
    os_name: "Android",
    os_version: "11",
    event_name: "session_start",
    event_value: "cold_start",
    category: "session",
    timestamp: "2024-01-16T09:15:00Z",
  },
  {
    id: "8",
    request_id: "req_008_2024",
    app_name: "Modobom Pro",
    app_id: "com.modobom.pro",
    app_version: "1.8.2",
    os_name: "iOS",
    os_version: "17.2",
    event_name: "api_call",
    event_value: "sync_completed",
    category: "system",
    timestamp: "2024-01-16T11:30:00Z",
  },
];

export default function AppInformationDataTable() {
  const t = useTranslations("AppInformationPage.table");

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [appFilter, setAppFilter] = useQueryState(
    "app_name",
    parseAsString.withDefault("")
  );
  const [osFilter, setOsFilter] = useQueryState(
    "os_name",
    parseAsString.withDefault("")
  );
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsString.withDefault("")
  );
  const [eventFilter, setEventFilter] = useQueryState(
    "event_name",
    parseAsString.withDefault("")
  );

  // Local state for filters (before applying)
  const [localSearch, setLocalSearch] = useState(search);
  const [selectedApps, setSelectedApps] = useState<string[]>(
    appFilter ? [appFilter] : []
  );
  const [selectedOS, setSelectedOS] = useState<string[]>(
    osFilter ? [osFilter] : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    eventFilter ? [eventFilter] : []
  );

  const [isLoading] = useState(false);
  const [isError] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  // Filter options
  const appOptions = [
    { value: "Modobom App", label: "Modobom App" },
    { value: "Modobom Pro", label: "Modobom Pro" },
    { value: "Modobom Lite", label: "Modobom Lite" },
  ];

  const osOptions = [
    { value: "Android", label: "Android" },
    { value: "iOS", label: "iOS" },
  ];

  const categoryOptions = [
    { value: "authentication", label: "Authentication" },
    { value: "commerce", label: "Commerce" },
    { value: "navigation", label: "Navigation" },
    { value: "error", label: "Error" },
    { value: "feature", label: "Feature" },
    { value: "engagement", label: "Engagement" },
    { value: "session", label: "Session" },
    { value: "system", label: "System" },
  ];

  const eventOptions = [
    { value: "user_login", label: "User Login" },
    { value: "purchase_completed", label: "Purchase Completed" },
    { value: "screen_view", label: "Screen View" },
    { value: "error_occurred", label: "Error Occurred" },
    { value: "feature_used", label: "Feature Used" },
    { value: "notification_clicked", label: "Notification Clicked" },
    { value: "session_start", label: "Session Start" },
    { value: "api_call", label: "API Call" },
  ];

  // Filter and paginate data
  const filteredData = useMemo(() => {
    let filtered = mockAppInformation;

    // Apply search filter
    if (debouncedSearch) {
      filtered = filtered.filter(
        (item) =>
          item.request_id
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          item.app_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.app_id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.event_name
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          item.event_value
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          item.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Apply app filter
    if (appFilter) {
      filtered = filtered.filter((item) => item.app_name === appFilter);
    }

    // Apply OS filter
    if (osFilter) {
      filtered = filtered.filter((item) => item.os_name === osFilter);
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Apply event filter
    if (eventFilter) {
      filtered = filtered.filter((item) => item.event_name === eventFilter);
    }

    return filtered;
  }, [debouncedSearch, appFilter, osFilter, categoryFilter, eventFilter]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const paginationInfo = {
    from: startIndex + 1,
    to: Math.min(endIndex, totalItems),
    total: totalItems,
    last_page: totalPages,
    current_page: currentPage,
  };

  const isDataEmpty = !paginatedData || paginatedData.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page ?? 1, prev + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Apply filters to URL
  const applyFilters = () => {
    setSearch(localSearch);
    setAppFilter(selectedApps.length > 0 ? selectedApps[0] : "");
    setOsFilter(selectedOS.length > 0 ? selectedOS[0] : "");
    setCategoryFilter(
      selectedCategories.length > 0 ? selectedCategories[0] : ""
    );
    setEventFilter(selectedEvents.length > 0 ? selectedEvents[0] : "");
    setCurrentPage(1);
  };

  // Handle checkbox changes
  const handleAppChange = (app: string, checked: boolean) => {
    setSelectedApps(checked ? [app] : []);
  };

  const handleOSChange = (os: string, checked: boolean) => {
    setSelectedOS(checked ? [os] : []);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const handleEventChange = (event: string, checked: boolean) => {
    setSelectedEvents((prev) =>
      checked ? [...prev, event] : prev.filter((e) => e !== event)
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      authentication:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      commerce:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      navigation:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      feature:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      engagement:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      session:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      system:
        "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
    );
  };

  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 items-end justify-end gap-4 md:grid-cols-3">
          <div>
            <Label
              className="text-foreground mb-2 block text-sm font-medium"
              htmlFor="search"
            >
              {t("filters.search")}
            </Label>
            <SearchInput
              className="w-full"
              placeholder={t("placeholders.search")}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tags Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* App Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  App Name
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by App
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {appOptions.map((app) => (
                      <div
                        key={app.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={app.value}
                          checked={selectedApps.includes(app.value)}
                          onCheckedChange={(checked) =>
                            handleAppChange(app.value, checked === true)
                          }
                        />
                        <label
                          htmlFor={app.value}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {app.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* OS Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  OS Name
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by OS
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {osOptions.map((os) => (
                      <div
                        key={os.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={os.value}
                          checked={selectedOS.includes(os.value)}
                          onCheckedChange={(checked) =>
                            handleOSChange(os.value, checked === true)
                          }
                        />
                        <label
                          htmlFor={os.value}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {os.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  Category
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by Category
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {categoryOptions.map((category) => (
                      <div
                        key={category.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.value}
                          checked={selectedCategories.includes(category.value)}
                          onCheckedChange={(checked) =>
                            handleCategoryChange(
                              category.value,
                              checked === true
                            )
                          }
                        />
                        <label
                          htmlFor={category.value}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Event Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  Event Type
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by Event
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {eventOptions.map((event) => (
                      <div
                        key={event.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={event.value}
                          checked={selectedEvents.includes(event.value)}
                          onCheckedChange={(checked) =>
                            handleEventChange(event.value, checked === true)
                          }
                        />
                        <label
                          htmlFor={event.value}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {event.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive text-sm">
                  {t("loadingStates.error")}
                </p>
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
                      <TableHead className="text-foreground w-[140px] py-3 font-medium">
                        Request ID
                      </TableHead>
                      <TableHead className="text-foreground w-[140px] py-3 font-medium">
                        App Name
                      </TableHead>
                      <TableHead className="text-foreground w-[180px] py-3 font-medium">
                        App ID
                      </TableHead>
                      <TableHead className="text-foreground w-[100px] py-3 font-medium">
                        App Version
                      </TableHead>
                      <TableHead className="text-foreground w-[100px] py-3 font-medium">
                        OS Name
                      </TableHead>
                      <TableHead className="text-foreground w-[100px] py-3 font-medium">
                        OS Version
                      </TableHead>
                      <TableHead className="text-foreground w-[200px] py-3 font-medium">
                        Event
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        Category
                      </TableHead>
                      <TableHead className="text-foreground w-[150px] py-3 font-medium">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-foreground w-[100px] py-3 font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item: AppInformationItem) => (
                      <TableRow
                        key={item.id}
                        className="border-border hover:bg-muted/50 group border-b transition-colors"
                      >
                        <TableCell className="py-3">
                          <span className="text-primary font-medium">
                            {item.request_id}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {item.app_name}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {item.app_id}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {item.app_version}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {item.os_name}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {item.os_version}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="space-y-1">
                            <div className="text-foreground text-sm font-medium">
                              {item.event_name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {item.event_value}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getCategoryColor(item.category)}`}
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {formatDateTime(new Date(item.timestamp))}
                        </TableCell>
                        <TableCell className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">
                                  {t("actions.title")}
                                </span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {t("actions.title")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem>
                                {t("actions.details")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {t("actions.export")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-border bg-background dark:bg-card sticky bottom-0 mt-auto border-t">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {t("pagination.rowsPerPage")}
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="border-border h-8 w-auto text-sm">
                        <SelectValue placeholder="10" />
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
                      {t("pagination.previousPage")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-4 text-sm font-medium"
                      onClick={handleNextPage}
                      disabled={currentPage === (paginationInfo.last_page ?? 1)}
                    >
                      {t("pagination.nextPage")}
                    </Button>
                  </div>
                </div>

                <div className="border-border bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
                  <div>
                    {t("pagination.viewing")} {paginationInfo.from ?? 1}-
                    {paginationInfo.to ??
                      Math.min(pageSize, paginationInfo.total ?? 0)}{" "}
                    {t("pagination.of")} {paginationInfo.total ?? 0}{" "}
                    {t("pagination.results")}
                  </div>
                  <div>
                    {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
                    {paginationInfo.last_page ?? 1}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
