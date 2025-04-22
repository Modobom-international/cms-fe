"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Map, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IUserTrackingData } from "@/types/user-tracking.type";

import { cn, formatDateTime } from "@/lib/utils";

import { useGetUserTracking } from "@/hooks/user-tracking";
import { useActiveUsers } from "@/hooks/user-tracking/use-active-users";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog as DialogUI,
} from "@/components/ui/dialog";
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

import FilterBar from "./filter-bar";

export default function UserTrackingDataTable() {
  const t = useTranslations("UserTrackingPage.table");
  const [showHeatmapModal, setShowHeatmapModal] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<IUserTrackingData | null>(null);

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
  const [domain] = useQueryState("domains", parseAsString.withDefault(""));
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

  // Type for mixed response data
  type UserTrackingItem = any;

  // Safely extract data from response with correct typing
  const userTrackingData = (() => {
    if (!userTrackingResponse) return [] as UserTrackingItem[];

    if ("data" in userTrackingResponse && userTrackingResponse.data) {
      if (Array.isArray(userTrackingResponse.data)) {
        return userTrackingResponse.data as UserTrackingItem[];
      } else if (
        "data" in userTrackingResponse.data &&
        Array.isArray(userTrackingResponse.data.data)
      ) {
        return userTrackingResponse.data.data as UserTrackingItem[];
      }
    }

    if ("value" in userTrackingResponse && userTrackingResponse.value?.data) {
      return userTrackingResponse.value.data as UserTrackingItem[];
    }

    return [] as UserTrackingItem[];
  })();

  // Safely extract pagination info from response
  const paginationInfo = (() => {
    if (!userTrackingResponse) {
      return {
        from: 0,
        to: 0,
        total: 0,
        last_page: 1,
      };
    }

    if (
      "data" in userTrackingResponse &&
      userTrackingResponse.data &&
      !Array.isArray(userTrackingResponse.data)
    ) {
      const { data, ...rest } = userTrackingResponse.data;
      return rest;
    }

    if ("value" in userTrackingResponse && userTrackingResponse.value) {
      return userTrackingResponse.value;
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

  const hasHeatmapData = (record: IUserTrackingData) => {
    return record.uuid && record.event_name.toLowerCase() === "mousemove";
  };

  const handleOpenHeatmap = (record: IUserTrackingData) => {
    setSelectedRecord(record);
    setShowHeatmapModal(true);
  };

  return (
    <div className="min-h- flex flex-col">
      <div className="space-y-4">
        {/* Use the new FilterBar component */}
        <FilterBar onFilterChange={handleFilterChange} />

        <div className="mb-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <Users className="text-primary h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">
                  {t("activeUsers.title")}
                </h3>
                <div className="flex items-baseline space-x-2">
                  {isLoadingActiveUsers ? (
                    <Spinner />
                  ) : (
                    <>
                      <span className="text-2xl font-bold">
                        {activeUsers?.count || 0}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {t("activeUsers.description")}
                      </span>
                    </>
                  )}
                </div>
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
                        {t("columns.id")}
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        Domain
                      </TableHead>
                      <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                        {t("columns.timestamp")}
                      </TableHead>
                      <TableHead className="w-[130px] py-3 font-medium text-gray-700">
                        {t("columns.browser")}
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
                    {userTrackingData.map((record: any, index: number) => (
                      <TableRow
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                          {record?.id?.$oid || record?.id || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-sm font-medium text-indigo-600">
                          {record?.domain || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {record.timestamp
                            ? formatDateTime(new Date(record.timestamp))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {record.ip || record.user?.browser?.name
                            ? `${record.user?.browser?.name || ""} ${record.user?.browser?.version || ""}`
                            : "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={getBadgeColor(
                              record.event_data?.device || "unknown"
                            )}
                          >
                            {getLocalizedDeviceType(
                              t,
                              record.event_data?.device || "unknown"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3 text-sm">
                          {renderUserBehavior(record, t)}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            {hasHeatmapData(record) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-900"
                                onClick={() => handleOpenHeatmap(record)}
                              >
                                <Map className="mr-2 h-3 w-3" />
                                Heatmap
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {t("actions.details")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page</span>
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

      <DialogUI open={showHeatmapModal} onOpenChange={setShowHeatmapModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Heatmap Visualization</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="mt-4">
              <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold">UUID:</span>{" "}
                  {selectedRecord.uuid || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Domain:</span>{" "}
                  {selectedRecord.domain || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Date:</span>{" "}
                  {selectedRecord.timestamp
                    ? format(new Date(selectedRecord.timestamp), "yyyy-MM-dd")
                    : "N/A"}
                </div>
              </div>

              <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                <div className="relative aspect-video w-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">
                      Heatmap visualization for mouse movement data:
                      <br />
                      Position: ({selectedRecord.event_data?.x ?? 0},{" "}
                      {selectedRecord.event_data?.y ?? 0})
                      <br />
                      Device: {selectedRecord.event_data?.device || "Unknown"}
                      <br />
                      Browser: {selectedRecord.user?.browser?.name ||
                        "Unknown"}{" "}
                      {selectedRecord.user?.browser?.version || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </DialogUI>
    </div>
  );
}

// Hàm hỗ trợ giữ nguyên
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

const renderUserBehavior = (record: any, t: (key: string) => string) => {
  if (!record || !record.event_data || !record.event_name) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-gray-600">Unknown</span>
      </div>
    );
  }

  const { event_name, event_data } = record;

  switch (event_name.toLowerCase()) {
    case "mousemove":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-indigo-600">
            {t("behaviors.mouseMovement")}
          </span>
          <span className="text-xs">
            {t("behaviors.position")}: ({event_data.x ?? 0}, {event_data.y ?? 0}
            )
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
            {t("behaviors.position")}: ({event_data.x ?? 0}, {event_data.y ?? 0}
            )
          </span>
          {(event_data.target || event_data.elementDetails) && (
            <span className="text-xs">
              {t("behaviors.target")}:{" "}
              {event_data.target ||
                (event_data.elementDetails &&
                  (event_data.elementDetails.textContent ||
                    event_data.elementDetails.tagName)) ||
                "Unknown"}
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
          <span className="text-xs">
            {t("behaviors.scrollPosition")}: ({event_data.scrollLeft ?? 0},{" "}
            {event_data.scrollTop ?? 0})
          </span>
        </div>
      );
    case "pageview":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-green-600">
            {t("behaviors.pageView")}
          </span>
          <span className="text-xs">
            {t("behaviors.target")}: {record.path || "Unknown"}
          </span>
        </div>
      );
    case "timespent":
      return (
        <div className="flex flex-col">
          <span className="font-medium text-purple-600">
            {t("behaviors.timeSpent")}
          </span>
          {(event_data.total || event_data.mouseMovements) && (
            <span className="text-xs">
              {t("behaviors.duration")}:{" "}
              {event_data.total
                ? `${(event_data.total / 1000).toFixed(1)}s`
                : event_data.mouseMovements
                  ? `${(event_data.mouseMovements / 10).toFixed(1)}s`
                  : "N/A"}
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
                {key}:{" "}
                {typeof value === "object"
                  ? JSON.stringify(value).substring(0, 30)
                  : String(value || "")}
              </span>
            ))}
        </div>
      );
  }
};
