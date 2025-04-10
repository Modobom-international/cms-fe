"use client";

import { format } from "date-fns";
import { RefreshCw, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IActivityLog } from "@/types/activity-log.type";

import { useGetActivityLogs } from "@/hooks/activity-log";

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

import { ActivityLogBadge } from "@/components/badge/activity-log-badge";
import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

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
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  const {
    data: activityLogResponse,
    isFetching,
    isError,
    refetch,
  } = useGetActivityLogs(currentPage, pageSize, search);

  // Extract data from the response
  const activityLogData = activityLogResponse?.data?.data || [];
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

  // Handler for refresh button click
  const handleRefresh = () => {
    refetch();
  };

  // Helper function to render activity details
  const renderActivityDetails = (log: IActivityLog) => {
    const { details } = log;
    if (!details) {
      return <span>No details available</span>;
    }

    const { filters } = details;

    return (
      <div className="flex flex-col">
        <span className="mb-1 font-medium">Filters:</span>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex items-center">
            <span className="mr-1 font-medium">Page:</span>
            <span>{filters.page || "1"}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1 font-medium">Page Size:</span>
            <span>{filters.pageSize || "10"}</span>
          </div>
          {filters.search && (
            <div className="flex items-center">
              <span className="mr-1 font-medium">Search:</span>
              <span>{filters.search}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-base text-gray-500">{t("description")}</p>
      </div>

      {/* Filters Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="search"
            >
              {t("filters.search")}
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder={t("placeholders.search")}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
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
              variant="outline"
              className="ml-4"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {t("actions.refresh") || "Refresh"}
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
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.user")}
                      </TableHead>
                      <TableHead className="w-[250px] py-3 font-medium text-gray-700">
                        {t("columns.details")}
                      </TableHead>
                      <TableHead className="py-3 text-right font-medium text-gray-700">
                        <span className="sr-only">{t("columns.actions")}</span>
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
                              ? format(
                                  new Date(log.details.logged_at),
                                  "yyyy-MM-dd HH:mm"
                                )
                              : format(
                                  new Date(log.created_at),
                                  "yyyy-MM-dd HH:mm"
                                )}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4 text-gray-500" />
                              <span>ID: {log.user_id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {renderActivityDetails(log)}
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
