"use client";

import { CalendarDate, parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { DatePicker } from "react-aria-components";

import { IActivityLog } from "@/types/activity-log.type";

import { formatDateTime } from "@/lib/utils";

import { useGetActivityLogs } from "@/hooks/activity-log";
import { useDebounce } from "@/hooks/use-debounce";

import { ActivityLogBadge } from "@/components/ui/badge/activity-log-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/datefield-rac";
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

// Action type constants
const ACTION_TYPES = {
  ACCESS_VIEW: "access_view",
  SHOW_RECORD: "show_record",
  CREATE_RECORD: "create_record",
  UPDATE_RECORD: "update_record",
  DELETE_RECORD: "delete_record",
} as const;

export default function ActivityLogDataTable() {
  const t = useTranslations("ActivityLogPage.table");

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
  };

  // Handle previous page navigation - decrement by 1
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const calendarDate = date ? parseDate(date) : undefined;
  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDate(newDate.toString());
    } else {
      setDate("");
    }
  };

  // Handle action checkbox change
  const handleActionChange = (action: string, checked: boolean) => {
    setSelectedActions((prev) => {
      if (checked) {
        return [...prev, action];
      } else {
        return prev.filter((a) => a !== action);
      }
    });
  };

  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="space-y-4">
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
        </div>

        {/* Second Row - Date Filter and Action Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filters */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <PlusCircle className="size-3.5" />
                  {t("filters.date")}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-sm font-medium">Select Date</h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="p-3">
                    <DatePicker
                      value={calendarDate}
                      onChange={handleDateChange}
                    >
                      <DateInput className="w-full" />
                    </DatePicker>
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between border-t border-gray-100 p-3">
                  <Button
                    onClick={() => {
                      setCurrentPage(1);
                      refetch();
                    }}
                    className="w-full"
                  >
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Type Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <PlusCircle className="size-3.5" />
                  Action Type
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-sm font-medium">Filter by Action Type</h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ACTION_TYPES.ACCESS_VIEW}
                        checked={selectedActions.includes(
                          ACTION_TYPES.ACCESS_VIEW
                        )}
                        onCheckedChange={(checked) =>
                          handleActionChange(
                            ACTION_TYPES.ACCESS_VIEW,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={ACTION_TYPES.ACCESS_VIEW}
                        className="text-sm"
                      >
                        Access View
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ACTION_TYPES.SHOW_RECORD}
                        checked={selectedActions.includes(
                          ACTION_TYPES.SHOW_RECORD
                        )}
                        onCheckedChange={(checked) =>
                          handleActionChange(
                            ACTION_TYPES.SHOW_RECORD,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={ACTION_TYPES.SHOW_RECORD}
                        className="text-sm"
                      >
                        Show Record
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ACTION_TYPES.CREATE_RECORD}
                        checked={selectedActions.includes(
                          ACTION_TYPES.CREATE_RECORD
                        )}
                        onCheckedChange={(checked) =>
                          handleActionChange(
                            ACTION_TYPES.CREATE_RECORD,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={ACTION_TYPES.CREATE_RECORD}
                        className="text-sm"
                      >
                        Create Record
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ACTION_TYPES.UPDATE_RECORD}
                        checked={selectedActions.includes(
                          ACTION_TYPES.UPDATE_RECORD
                        )}
                        onCheckedChange={(checked) =>
                          handleActionChange(
                            ACTION_TYPES.UPDATE_RECORD,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={ACTION_TYPES.UPDATE_RECORD}
                        className="text-sm"
                      >
                        Update Record
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={ACTION_TYPES.DELETE_RECORD}
                        checked={selectedActions.includes(
                          ACTION_TYPES.DELETE_RECORD
                        )}
                        onCheckedChange={(checked) =>
                          handleActionChange(
                            ACTION_TYPES.DELETE_RECORD,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={ACTION_TYPES.DELETE_RECORD}
                        className="text-sm"
                      >
                        Delete Record
                      </label>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between border-t border-gray-100 p-3">
                  <Button
                    onClick={() => {
                      setCurrentPage(1);
                      refetch();
                    }}
                    className="w-full"
                  >
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Results Table or Empty State */}
        <div className="flex-grow">
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
                  <div className="flex items-center gap-2">
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
