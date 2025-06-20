"use client";

import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IAppInformation } from "@/types/app-information.type";

import { formatDateTime } from "@/lib/utils";

import { useGetAppInformation } from "@/hooks/app-infomation";

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
  });

  const appInformationList: IAppInformation[] =
    appInformationData?.data?.data ?? [];

  const paginationInfo =
    appInformationData?.data ??
    ({
      from: 0,
      to: 0,
      total: 0,
      last_page: 1,
      current_page: 1,
      per_page: pageSize,
    } as any);

  const isDataEmpty = appInformationList.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page ?? 1, prev + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleFiltersApply = (filters: {
    app_name: string[];
    os_name: string[];
    os_version: string[];
    app_version: string[];
    category: string[];
    platform: string[];
    country: string[];
    event_name: string[];
  }) => {
    setAppFilter(filters.app_name.join(","));
    setOsFilter(filters.os_name.join(","));
    setOsVersionFilter(filters.os_version.join(","));
    setAppVersionFilter(filters.app_version.join(","));
    setCategoryFilter(filters.category.join(","));
    setPlatformFilter(filters.platform.join(","));
    setCountryFilter(filters.country.join(","));
    setEventFilter(filters.event_name.join(","));
    setCurrentPage(1);
  };

  const handleClearFilter = (filterType: string) => {
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
    }
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setAppFilter("");
    setOsFilter("");
    setOsVersionFilter("");
    setAppVersionFilter("");
    setCategoryFilter("");
    setPlatformFilter("");
    setCountryFilter("");
    setEventFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-y-6">
      <FilterBar
        appFilter={appFilter}
        osFilter={osFilter}
        osVersionFilter={osVersionFilter}
        categoryFilter={categoryFilter}
        eventFilter={eventFilter}
        platformFilter={platformFilter}
        countryFilter={countryFilter}
        appVersionFilter={appVersionFilter}
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
                      {t("columns.requestId")}
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
                        {item.os_name}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.os_version}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-foreground font-medium">
                          {item.event_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {item.category}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {formatDateTime(new Date(item.created_at))}
                      </TableCell>
                      <TableCell className="text-foreground py-3">
                        {formatDateTime(new Date(item.updated_at))}
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
