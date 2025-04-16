"use client";

import React from "react";

import { CalendarDate, parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import {
  Button as ButtonAria,
  DatePicker,
  Dialog,
  Group,
  Popover as PopoverAria,
} from "react-aria-components";

import { IActivityLog } from "@/types/activity-log.type";

import { formatDateTime } from "@/lib/utils";

import { useGetActivityLogs } from "@/hooks/activity-log";
import { useDebounce } from "@/hooks/use-debounce";

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

import { ActivityLogBadge } from "@/components/badge/activity-log-badge";
import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";
import { SearchInput } from "@/components/inputs/search-input";

// Action type constants
const ACTION_TYPES = {
  ACCESS_VIEW: "access_view",
  SHOW_RECORD: "show_record",
  CREATE_RECORD: "create_record",
  UPDATE_RECORD: "update_record",
  DELETE_RECORD: "delete_record",
} as const;

type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

export default function ActivityLogDataTable() {
  const t = useTranslations("ActivityLogPage.table");
  const [isActionFilterOpen, setIsActionFilterOpen] = React.useState(false);
  const actionFilterRef = React.useRef<HTMLDivElement>(null);

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
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd"))
  );
  const [selectedActions, setSelectedActions] = useQueryState(
    "actions",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const debouncedSearch = useDebounce(email, 500);

  const {
    data: activityLogResponse,
    isFetching,
    isError,
    refetch,
  } = useGetActivityLogs(currentPage, pageSize, debouncedSearch);

  // Extract data from the response
  const activityLogData =
    activityLogResponse?.data?.data || ([] as IActivityLog[]);
  const paginationInfo = activityLogResponse?.data || {
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
  };
  const isDataEmpty = !activityLogData || activityLogData.length === 0;

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

  const calendarDate = date ? parseDate(date) : undefined;
  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDate(newDate.toString());
    } else {
      setDate("");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-end justify-end gap-4 md:grid-cols-3">
          <div>
            <Label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="search"
            >
              {t("filters.searchByEmail")}
            </Label>
            <SearchInput
              className="w-full"
              placeholder="Search by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Date Filters */}
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
              <PopoverAria
                className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
                offset={4}
              >
                <Dialog className="max-h-[inherit] overflow-auto p-2">
                  <Calendar />
                </Dialog>
              </PopoverAria>
            </DatePicker>
          </div>

          <div className="flex items-center">
            <Button
              onClick={() => {
                setCurrentPage(1); // Reset to first page when searching
                refetch();
              }}
              disabled={isFetching}
            >
              <Search className="mr-2 h-4 w-4" /> {t("filters.apply")}
            </Button>
          </div>
        </div>

        {/* Results Table or Empty State */}
        <div className="mt-4 flex-grow">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Spinner />
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive text-sm">
                  {t("loadingStates.error")}
                </p>
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                    refetch();
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  {t("actions.retry")}
                </Button>
              </div>
            </div>
          ) : isDataEmpty ? (
            <EmptyTable />
          ) : (
            <div className="flex flex-col">
              {/* Data Table Section */}
              <div className="relative w-full overflow-auto">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[60px] py-3 font-medium text-gray-700">
                        {t("columns.id")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.action")}
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        {t("columns.timestamp")}
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        {t("columns.userEmail")}
                      </TableHead>
                      <TableHead className="w-[250px] py-3 font-medium text-gray-700">
                        {t("columns.details")}
                      </TableHead>
                      <TableHead className="py-3 font-medium text-gray-700">
                        {t("columns.description")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogData.map((log: IActivityLog, index: number) => {
                      return (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                            {log.id}
                          </TableCell>
                          <TableCell className="py-3">
                            <ActivityLogBadge action={log.action} />
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {log.details && log.details.logged_at
                              ? formatDateTime(new Date(log.details.logged_at))
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            <div className="flex items-center">
                              <span>{log.user_email || "—"}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground py-3 text-sm">
                            <div className="flex flex-col">
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                <div className="flex items-center">
                                  <span className="mr-1 font-medium">
                                    Page:
                                  </span>
                                  <span>
                                    {log.details?.filters?.page || "-"}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="mr-1 font-medium">
                                    Page Size:
                                  </span>
                                  <span>
                                    {log.details?.filters?.pageSize || "-"}
                                  </span>
                                </div>
                                {log.details?.filters?.search && (
                                  <div className="flex items-center">
                                    <span className="mr-1 font-medium">
                                      Search:
                                    </span>
                                    <span>{log.details?.filters?.search}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {log.description || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Section - Fixed at bottom when scrolling */}
              <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white">
                {/* Main pagination controls */}
                <div className="flex items-center justify-between px-4 py-2">
                  {/* Results per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {t("pagination.rowsPerPage")}
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-auto border-gray-200 text-sm">
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
                      {t("pagination.previousPage")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-gray-200 px-4 text-sm font-medium text-gray-700"
                      onClick={handleNextPage}
                      disabled={currentPage === paginationInfo.last_page}
                    >
                      {t("pagination.nextPage")}
                    </Button>
                  </div>
                </div>

                {/* Bottom status line */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  <div>
                    Viewing {paginationInfo.from || 1}-
                    {paginationInfo.to ||
                      Math.min(pageSize, paginationInfo.total || 0)}{" "}
                    {t("pagination.of")} {paginationInfo.total || 0} results
                  </div>
                  <div>
                    Page {currentPage} {t("pagination.of")}{" "}
                    {paginationInfo.last_page || 1}
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
