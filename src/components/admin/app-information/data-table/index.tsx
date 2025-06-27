"use client";

import { useCallback, useMemo } from "react";

import { Activity, BarChart3, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IAppInformation } from "@/types/app-information.type";

import {
  formatDateForApiEnd,
  formatDateForApiStart,
  formatDateTime,
  getCurrentTimezoneInfo,
} from "@/lib/utils";

import { useGetAppInformation } from "@/hooks/app-information";

import { Button } from "@/components/ui/button";
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
import { ErrorTable } from "@/components/data-table/error-table";
import { Spinner } from "@/components/global/spinner";

import { FilterBar } from "./filter-bar";

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
  const [platformFilter, setPlatformFilter] = useQueryState(
    "platform",
    parseAsString.withDefault("")
  );
  const [countryFilter, setCountryFilter] = useQueryState(
    "country",
    parseAsString.withDefault("")
  );
  const [appVersionFilter, setAppVersionFilter] = useQueryState(
    "app_version",
    parseAsString.withDefault("")
  );
  const [osVersionFilter, setOsVersionFilter] = useQueryState(
    "os_version",
    parseAsString.withDefault("")
  );
  const [networkFilter, setNetworkFilter] = useQueryState(
    "network",
    parseAsString.withDefault("")
  );
  const [eventValueFilter, setEventValueFilter] = useQueryState(
    "event_value",
    parseAsString.withDefault("")
  );
  const [dateFromFilter, setDateFromFilter] = useQueryState(
    "date_from",
    parseAsString.withDefault("")
  );
  const [dateToFilter, setDateToFilter] = useQueryState(
    "date_to",
    parseAsString.withDefault("")
  );

  const dateFilter = useMemo(
    () => ({
      from: dateFromFilter ? new Date(dateFromFilter) : null,
      to: dateToFilter ? new Date(dateToFilter) : null,
    }),
    [dateFromFilter, dateToFilter]
  );

  const {
    data: appInformationData,
    isLoading,
    isError,
  } = useGetAppInformation(currentPage, pageSize, {
    app_name: appFilter ? appFilter.split(",").filter(Boolean) : undefined,
    os_name: osFilter ? osFilter.split(",").filter(Boolean) : undefined,
    os_version: osVersionFilter
      ? osVersionFilter.split(",").filter(Boolean)
      : undefined,
    app_version: appVersionFilter
      ? appVersionFilter.split(",").filter(Boolean)
      : undefined,
    category: categoryFilter
      ? categoryFilter.split(",").filter(Boolean)
      : undefined,
    platform: platformFilter
      ? platformFilter.split(",").filter(Boolean)
      : undefined,
    country: countryFilter
      ? countryFilter.split(",").filter(Boolean)
      : undefined,
    event_name: eventFilter
      ? eventFilter.split(",").filter(Boolean)
      : undefined,
    network: networkFilter
      ? networkFilter.split(",").filter(Boolean)
      : undefined,
    event_value: eventValueFilter
      ? eventValueFilter.split(",").filter(Boolean)
      : undefined,
    // Note: from and to will always be present due to default values in the hook
    from: dateFromFilter || undefined,
    to: dateToFilter || undefined,
  });

  const appInformationList: IAppInformation[] =
    (appInformationData?.data as any)?.list?.data ?? [];

  const paginationInfo = (appInformationData?.data as any)?.list ?? {
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
    current_page: 1,
    per_page: pageSize,
  };

  const totalUsers = (appInformationData?.data as any)?.total_user ?? 0;
  const countEvents: Array<{
    event_name: string;
    values: Array<{
      event_value: string;
      count: number;
    }>;
  }> = (appInformationData?.data as any)?.count_event ?? [];

  const isDataEmpty = appInformationList.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page ?? 1, prev + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleFiltersApply = useCallback(
    (filters: {
      app_name: string[];
      os_name: string[];
      os_version: string[];
      app_version: string[];
      category: string[];
      platform: string[];
      country: string[];
      event_name: string[];
      network: string[];
      event_value: string[];
      date_range: { from: Date | null; to: Date | null };
    }) => {
      setAppFilter(filters.app_name.join(","));
      setOsFilter(filters.os_name.join(","));
      setOsVersionFilter(filters.os_version.join(","));
      setAppVersionFilter(filters.app_version.join(","));
      setCategoryFilter(filters.category.join(","));
      setPlatformFilter(filters.platform.join(","));
      setCountryFilter(filters.country.join(","));
      setEventFilter(filters.event_name.join(","));
      setNetworkFilter(filters.network.join(","));
      setEventValueFilter(filters.event_value.join(","));

      // Format dates for backend API (always include time)
      setDateFromFilter(
        filters.date_range.from
          ? formatDateForApiStart(filters.date_range.from)
          : ""
      );
      setDateToFilter(
        filters.date_range.to ? formatDateForApiEnd(filters.date_range.to) : ""
      );
      setCurrentPage(1);
    },
    [
      setAppFilter,
      setOsFilter,
      setOsVersionFilter,
      setAppVersionFilter,
      setCategoryFilter,
      setPlatformFilter,
      setCountryFilter,
      setEventFilter,
      setNetworkFilter,
      setEventValueFilter,
      setDateFromFilter,
      setDateToFilter,
      setCurrentPage,
    ]
  );

  const handleClearFilter = useCallback(
    (filterType: string) => {
      switch (filterType) {
        case "app_name":
          setAppFilter("");
          break;
        case "os_name":
          setOsFilter("");
          break;
        case "os_version":
          setOsVersionFilter("");
          break;
        case "app_version":
          setAppVersionFilter("");
          break;
        case "category":
          setCategoryFilter("");
          break;
        case "platform":
          setPlatformFilter("");
          break;
        case "country":
          setCountryFilter("");
          break;
        case "event_name":
          setEventFilter("");
          break;
        case "network":
          setNetworkFilter("");
          break;
        case "event_value":
          setEventValueFilter("");
          break;
        case "date_range":
          // Reset to default date range instead of empty
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          setDateFromFilter(formatDateForApiStart(yesterday));
          setDateToFilter(formatDateForApiEnd(today));
          break;
      }
      setCurrentPage(1);
    },
    [
      setAppFilter,
      setOsFilter,
      setOsVersionFilter,
      setAppVersionFilter,
      setCategoryFilter,
      setPlatformFilter,
      setCountryFilter,
      setEventFilter,
      setNetworkFilter,
      setEventValueFilter,
      setDateFromFilter,
      setDateToFilter,
      setCurrentPage,
    ]
  );

  const handleClearAllFilters = useCallback(() => {
    setAppFilter("");
    setOsFilter("");
    setOsVersionFilter("");
    setAppVersionFilter("");
    setCategoryFilter("");
    setPlatformFilter("");
    setCountryFilter("");
    setEventFilter("");
    setNetworkFilter("");
    setEventValueFilter("");

    // Reset to default date range instead of empty
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    setDateFromFilter(formatDateForApiStart(yesterday));
    setDateToFilter(formatDateForApiEnd(today));

    setCurrentPage(1);
  }, [
    setAppFilter,
    setOsFilter,
    setOsVersionFilter,
    setAppVersionFilter,
    setCategoryFilter,
    setPlatformFilter,
    setCountryFilter,
    setEventFilter,
    setNetworkFilter,
    setEventValueFilter,
    setDateFromFilter,
    setDateToFilter,
    setCurrentPage,
  ]);

  return (
    <div className="flex flex-col gap-y-6">
      {/* Stripe-like Header */}
      <div className="space-y-4">
        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t("overview.totalEvents")}
                </p>
                <p className="text-2xl font-bold">
                  {paginationInfo.total?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {t("overview.totalUsers")}
                </p>
                <p className="text-2xl font-bold">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Event Count Overview - Show when event filter is applied */}
        {eventFilter && countEvents.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            {/* Header with Summary */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <BarChart3 className="text-muted-foreground h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("overview.eventBreakdown")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {countEvents.length} {t("overview.eventTypes")} •{" "}
                    {countEvents
                      .reduce(
                        (total, group) =>
                          total +
                          group.values.reduce((sum, val) => sum + val.count, 0),
                        0
                      )
                      .toLocaleString()}{" "}
                    {t("overview.totalEventsCount")}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Groups */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {countEvents.map((eventGroup) => {
                const totalEventCount = eventGroup.values.reduce(
                  (sum, val) => sum + val.count,
                  0
                );

                return (
                  <div
                    key={eventGroup.event_name}
                    className="bg-background rounded-lg border p-4"
                  >
                    {/* Event Type Header */}
                    <div className="mb-4">
                      <h4 className="mb-1 font-semibold">
                        {eventGroup.event_name}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {totalEventCount.toLocaleString()}{" "}
                        {t("overview.totalEventsCount")} •{" "}
                        {eventGroup.values.length} {t("overview.moreValues")}
                      </p>
                    </div>

                    {/* Event Values */}
                    <div className="space-y-3">
                      {eventGroup.values.slice(0, 5).map((value, index) => (
                        <div
                          key={`${eventGroup.event_name}-${value.event_value}-${index}`}
                          className="flex items-center justify-between"
                        >
                          <span
                            className="max-w-[120px] truncate text-sm font-medium"
                            title={value.event_value}
                          >
                            {value.event_value || t("overview.noValue")}
                          </span>
                          <span className="text-sm font-bold">
                            {value.count.toLocaleString()}
                          </span>
                        </div>
                      ))}

                      {eventGroup.values.length > 5 && (
                        <div className="border-t pt-2">
                          <p className="text-muted-foreground text-center text-xs">
                            +{eventGroup.values.length - 5}{" "}
                            {t("overview.moreValues")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <FilterBar
        appFilter={appFilter}
        osFilter={osFilter}
        osVersionFilter={osVersionFilter}
        categoryFilter={categoryFilter}
        eventFilter={eventFilter}
        platformFilter={platformFilter}
        countryFilter={countryFilter}
        appVersionFilter={appVersionFilter}
        networkFilter={networkFilter}
        eventValueFilter={eventValueFilter}
        dateFilter={dateFilter}
        eventCounts={countEvents}
        onFiltersApply={handleFiltersApply}
        onClearFilter={handleClearFilter}
        onClearAllFilters={handleClearAllFilters}
      />

      {/* Data Table */}
      <div className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : isError ? (
          <ErrorTable />
        ) : isDataEmpty ? (
          <EmptyTable />
        ) : (
          <div className="flex flex-col">
            <div className="relative w-full overflow-auto">
              <Table className="w-full">
                <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                  <TableRow className="border-border hover:bg-muted/50 border-b">
                    <TableHead className="text-foreground w-[140px] py-3 font-medium">
                      {t("columns.requestId")}
                    </TableHead>
                    <TableHead className="text-foreground w-[140px] py-3 font-medium">
                      {t("columns.userId")}
                    </TableHead>
                    <TableHead className="text-foreground w-[140px] py-3 font-medium">
                      {t("columns.appName")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 font-medium">
                      {t("columns.appVersion")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 font-medium">
                      {t("columns.platform")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 font-medium">
                      {t("columns.country")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 font-medium">
                      {t("columns.network")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 font-medium">
                      {t("columns.osName")}
                    </TableHead>
                    <TableHead className="text-foreground w-[100px] py-3 font-medium">
                      {t("columns.osVersion")}
                    </TableHead>
                    <TableHead className="text-foreground w-[200px] py-3 font-medium">
                      {t("columns.event")}
                    </TableHead>
                    <TableHead className="text-foreground w-[120px] py-3 font-medium">
                      {t("columns.category")}
                    </TableHead>
                    <TableHead className="text-foreground w-[150px] py-3 font-medium">
                      {t("columns.createdAt")}
                    </TableHead>
                    <TableHead className="text-foreground w-[150px] py-3 font-medium">
                      {t("columns.updatedAt")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appInformationList.map((item: IAppInformation) => (
                    <TableRow
                      key={item.id}
                      className="border-border hover:bg-muted/50 group border-b text-xs transition-colors"
                    >
                      <TableCell className="py-3">
                        <span className="text-primary font-medium">
                          {item.request_id}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-medium">{item.user_id}</span>
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.app_name}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.app_version || "—"}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.platform || "—"}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.country || "—"}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.network || "—"}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.os_name}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.os_version}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-foreground font-medium">
                            {item.event_name}
                          </div>
                          <div className="text-muted-foreground w-fit">
                            {item.event_value}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.category}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium">
                            {getCurrentTimezoneInfo(item.created_at)
                              .convertedTime || "—"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {getCurrentTimezoneInfo().timezoneFormat}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium">
                            {getCurrentTimezoneInfo(item.updated_at)
                              .convertedTime || "—"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {getCurrentTimezoneInfo().timezoneFormat}
                          </div>
                        </div>
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
  );
}
