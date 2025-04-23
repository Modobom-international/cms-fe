"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Play, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import {
  IUserTrackingData,
  IUserTrackingSummary,
} from "@/types/user-tracking.type";

import { useGetUserTracking } from "@/hooks/user-tracking";
import { useActiveUsers } from "@/hooks/user-tracking/use-active-users";

import { Button } from "@/components/ui/button";
import { Dialog as DialogUI } from "@/components/ui/dialog";
import { Icons } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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

import FilterBar from "./filter-bar";
import HeatmapDialog from "./heatmap-dialog";

export default function UserTrackingDataTable() {
  const t = useTranslations("UserTrackingPage.table");
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<IUserTrackingSummary | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );

  // Get current filter values from URL
  const [date] = useQueryState(
    "date",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd"))
  );
  const [domain] = useQueryState("domain", parseAsString.withDefault(""));
  const [path] = useQueryState("path", parseAsString.withDefault("all"));

  // Fetch data based on filters
  const {
    data: userTrackingResponse,
    isFetching,
    isError,
    refetch,
  } = useGetUserTracking(currentPage, pageSize, date, domain, path);
  const { data: activeUsers, isLoading: isLoadingActiveUsers } = useActiveUsers(
    domain,
    path
  );

  // Process response data to get summarized tracking data
  const userTrackingData = (() => {
    if (!userTrackingResponse || !userTrackingResponse.success) {
      return [] as IUserTrackingSummary[];
    }

    // Handle nested data structure
    let rawData: IUserTrackingData[] = [];

    if (
      userTrackingResponse.data &&
      Array.isArray(userTrackingResponse.data.data)
    ) {
      const nestedData = userTrackingResponse.data.data;

      // Check if it's a 2D array and flatten it
      if (nestedData.length > 0 && Array.isArray(nestedData[0])) {
        rawData = (nestedData as any[][]).flat() as IUserTrackingData[];
      } else {
        // It's already a flat array
        rawData = nestedData as IUserTrackingData[];
      }
    } else {
      return [] as IUserTrackingSummary[];
    }

    // Group by uuid, domain, path and count events
    const eventMap = new Map<string, IUserTrackingSummary>();

    rawData.forEach((event: IUserTrackingData) => {
      const key = `${event.uuid}_${event.domain}_${event.path}`;
      if (eventMap.has(key)) {
        const existingEntry = eventMap.get(key)!;
        existingEntry.eventCount += 1;
      } else {
        eventMap.set(key, {
          uuid: event.uuid,
          domain: event.domain,
          path: event.path,
          eventCount: 1,
        });
      }
    });

    // Convert map to array
    return Array.from(eventMap.values());
  })();

  // Safely extract pagination info from response
  const paginationInfo = (() => {
    if (!userTrackingResponse || !userTrackingResponse.success) {
      return {
        from: 0,
        to: 0,
        total: 0,
        last_page: 1,
      };
    }

    if (userTrackingResponse.data) {
      const { data, ...rest } = userTrackingResponse.data;
      return rest;
    }

    return {
      from: 0,
      to: 0,
      total: 0,
      last_page: 1,
    };
  })();

  const isDataEmpty = !userTrackingData || userTrackingData.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleOpenHeatmap = (record: IUserTrackingSummary) => {
    setSelectedRecord(record);
    setShowHeatmapModal(true);
  };

  return (
    <div className="min-h- flex flex-col">
      <div className="space-y-4">
        {/* Use the new FilterBar component */}
        <FilterBar onFilterChange={handleFilterChange} />

        <div className="mb-6">
          <div className="border-border overflow-hidden rounded-lg border bg-white">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2.5">
                  <Users className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {t("activeUsers.title")}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t("activeUsers.description")}
                  </p>
                </div>
              </div>

              <div className="pr-2">
                {isLoadingActiveUsers ? (
                  <div className="flex flex-col items-end">
                    <Skeleton className="mb-1 h-7 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-primary text-2xl font-semibold">
                      {activeUsers?.count || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(), "yyyy-MM-dd")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex-grow">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
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
            <EmptyTable />
          ) : (
            <div className="flex flex-col">
              <div className="relative w-full">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[80px] py-3 font-medium text-gray-700">
                        <span className="sr-only">{t("columns.actions")}</span>
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        {t("columns.domain")}
                      </TableHead>
                      <TableHead className="w-[250px] py-3 font-medium text-gray-700">
                        {t("columns.path")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.eventCount")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTrackingData.map(
                      (record: IUserTrackingSummary, index: number) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary hover:text-primary flex items-center justify-center rounded-full border-gray-300 px-2 py-1"
                              onClick={() => handleOpenHeatmap(record)}
                            >
                              <Icons.play className="text-primary size-3.5" />
                              Heatmap
                            </Button>
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-indigo-600">
                            {record?.domain || "—"}
                          </TableCell>
                          <TableCell
                            className="text-muted-foreground max-w-xs truncate py-3 text-sm"
                            title={record?.path || ""}
                          >
                            {record?.path || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                            {record.eventCount || 0}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-2">
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

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  <div>
                    {t("pagination.showing")} {paginationInfo.from || 1}-
                    {paginationInfo.to ||
                      Math.min(pageSize, paginationInfo.total || 0)}{" "}
                    {t("pagination.of")} {paginationInfo.total || 0}{" "}
                    {t("pagination.results")}
                  </div>
                  <div>
                    {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
                    {paginationInfo.last_page || 1}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogUI open={showHeatmapModal} onOpenChange={setShowHeatmapModal}>
        <HeatmapDialog selectedRecord={selectedRecord} />
      </DialogUI>
    </div>
  );
}
