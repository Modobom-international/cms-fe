"use client";

import { CalendarDate, parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarIcon, Map, RefreshCw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Button as ButtonAria,
  DatePicker,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";

import { IUserTracking } from "@/types/user-tracking.type";

import { useGetUserTracking } from "@/hooks/user-tracking";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
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

import { EmptyTable } from "@/components/data-table/empty-table";

export default function UserTrackingDataTable() {
  const t = useTranslations("UserTrackingPage.table");

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd"))
  );
  const [domain, setDomain] = useQueryState(
    "domain",
    parseAsString.withDefault("apkafe.com")
  );

  const {
    data: userTrackingResponse,
    isFetching,
    isError,
    refetch,
  } = useGetUserTracking(currentPage, pageSize, date, domain);

  // Extract data from the response
  const userTrackingData = userTrackingResponse?.data?.data || [];
  const paginationInfo = userTrackingResponse?.data || {
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
  };
  const isDataEmpty = !userTrackingData || userTrackingData.length === 0;

  // Function to handle page changes with minimum value check
  const handlePageChange = (delta: number) => {
    setCurrentPage((prev) => Math.max(1, prev + delta));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle next page navigation - increment by 1
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle previous page navigation - decrement by 1
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Convert string date to CalendarDate and back
  const calendarDate = date ? parseDate(date) : undefined;
  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDate(newDate.toString());
    } else {
      setDate("");
    }
  };

  // Handler for refresh button click
  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Filters Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="domain"
            >
              {t("filters.selectDomain")}
            </label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("placeholders.selectDomain")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apkafe.com">apkafe.com</SelectItem>
                <SelectItem value="vnitourist.com">vnitourist.com</SelectItem>
                <SelectItem value="vnifood.com">vnifood.com</SelectItem>
                <SelectItem value="betonamuryori.com">
                  betonamuryori.com
                </SelectItem>
                <SelectItem value="lifecompass365.com">
                  lifecompass365.com
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <DatePicker
              className="*:not-first:mt-2"
              value={calendarDate}
              onChange={handleDateChange}
            >
              <Label className="text-foreground text-sm font-medium">
                {t("filters.datePicker")}
              </Label>
              <div className="flex">
                <Group className="w-full">
                  <DateInput className="pe-9" />
                </Group>
                <ButtonAria className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
                  <CalendarIcon size={16} />
                </ButtonAria>
              </div>
              <Popover
                className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
                offset={4}
              >
                <Dialog className="max-h-[inherit] overflow-auto p-2">
                  <Calendar />
                </Dialog>
              </Popover>
            </DatePicker>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setCurrentPage(1); // Reset to first page when searching
                refetch();
              }}
              disabled={isFetching}
            >
              <Search className="mr-2 h-4 w-4" /> {t("filters.search")}
            </Button>

            <Button
              variant="default"
              className="ml-4 bg-emerald-600 hover:bg-emerald-700"
            >
              <Map className="mr-2 h-4 w-4" /> {t("filters.viewHeatmap")}
            </Button>

            <Button
              variant="outline"
              className="ml-4"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Results Table or Empty State */}
        <div className="mt-4 flex-grow">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
                <p className="text-muted-foreground mt-4 text-sm">Loading...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive text-sm">
                  {t("loadingStates.error")}
                </p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="mt-4"
                >
                  {t("actions.retry")}
                </Button>
              </div>
            </div>
          ) : isDataEmpty ? (
            <EmptyTable onRefresh={handleRefresh} />
          ) : (
            <div className="flex flex-col">
              {/* Data Table Section */}
              <div className="relative w-full">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[80px] py-3 font-medium text-gray-700">
                        {t("columns.id")}
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        Domain
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        {t("columns.timestamp")}
                      </TableHead>
                      <TableHead className="w-[130px] py-3 font-medium text-gray-700">
                        {t("columns.ip")}
                      </TableHead>
                      <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                        {t("columns.device")}
                      </TableHead>
                      <TableHead className="w-[200px] py-3 font-medium text-gray-700">
                        {t("columns.userBehavior")}
                      </TableHead>
                      <TableHead className="py-3 text-right font-medium text-gray-700">
                        <span className="sr-only">{t("columns.actions")}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTrackingData.map(
                      (record: IUserTracking, index: number) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                            {record.id.$oid}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {record.domain}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            {format(
                              new Date(record.timestamp),
                              "yyyy-MM-dd HH:mm:ss"
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            {record.ip}
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className={getBadgeColor(
                                record.event_data.device
                              )}
                            >
                              {getLocalizedDeviceType(
                                t,
                                record.event_data.device
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {renderUserBehavior(record, t)}
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {t("actions.details")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Section - Fixed at bottom when scrolling */}
              <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white">
                {/* Main pagination controls */}
                <div className="flex items-center justify-between px-4 py-2">
                  {/* Results per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-14 border-gray-200 text-sm">
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

                  {/* Pagination controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-200 px-4 text-sm font-medium text-gray-700"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-200 px-4 text-sm font-medium text-gray-700"
                      onClick={handleNextPage}
                      disabled={currentPage === paginationInfo.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {/* Bottom status line */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
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
        </div>
      </div>
    </div>
  );
}

const getBadgeColor = (device: string) => {
  switch (device.toLowerCase()) {
    case "mobile":
      return "bg-purple-100 text-purple-800";
    case "tablet":
      return "bg-blue-100 text-blue-800";
    case "desktop":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get localized device type
const getLocalizedDeviceType = (
  t: (key: string) => string,
  device: string
): string => {
  switch (device.toLowerCase()) {
    case "mobile":
      return t("deviceTypes.mobile");
    case "tablet":
      return t("deviceTypes.tablet");
    case "desktop":
      return t("deviceTypes.desktop");
    default:
      return device;
  }
};

// Helper function to render user behavior based on event_name and event_data
const renderUserBehavior = (
  record: IUserTracking,
  t: (key: string) => string
) => {
  const { event_name, event_data } = record;

  switch (event_name.toLowerCase()) {
    case "mousemove":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-indigo-600">
            {t("behaviors.mouseMovement")}
          </span>
          <span className="text-xs">
            {t("behaviors.position")}: ({event_data.x}, {event_data.y})
          </span>
          {event_data.mouseMovements && (
            <span className="text-xs">
              {t("behaviors.totalMovements")}: {event_data.mouseMovements}
            </span>
          )}
        </div>
      );
    case "click":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600">
            {t("behaviors.click")}
          </span>
          <span className="text-xs">
            {t("behaviors.position")}: ({event_data.x}, {event_data.y})
          </span>
          {event_data.target && (
            <span className="text-xs">
              {t("behaviors.target")}: {event_data.target}
            </span>
          )}
        </div>
      );
    case "scroll":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-amber-600">
            {t("behaviors.scroll")}
          </span>
          {event_data.height && (
            <span className="text-xs">
              {t("behaviors.height")}: {event_data.height}px
            </span>
          )}
        </div>
      );
    case "pageview":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-green-600">
            {t("behaviors.pageView")}
          </span>
          <span className="text-xs">
            {t("behaviors.target")}: {record.path}
          </span>
        </div>
      );
    case "timespent":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-purple-600">
            {t("behaviors.timeSpent")}
          </span>
          {event_data.total && (
            <span className="text-xs">
              {t("behaviors.duration")}: {(event_data.total / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      );
    default:
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-600">{event_name}</span>
          {Object.entries(event_data)
            .filter(([key]) => key !== "device")
            .slice(0, 2)
            .map(([key, value]) => (
              <span key={key} className="text-xs">
                {key}: {value}
              </span>
            ))}
        </div>
      );
  }
};

