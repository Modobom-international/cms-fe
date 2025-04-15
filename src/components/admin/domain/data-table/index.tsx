"use client";

import { DomainStatusEnum } from "@/enums/domain-status";
import { format } from "date-fns";
import { Lock, LockOpen, RefreshCw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IDomainActual } from "@/types/domain.type";

import { useGetDomainList } from "@/hooks/domain";
import { useDebounce } from "@/hooks/use-debounce";

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

import { DomainStatusBadge } from "@/components/badge/domain-status-badge";
import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

export default function DomainDataTable() {
  const t = useTranslations("DomainPage.table");

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

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: domainResponse,
    isFetching,
    isError,
    refetch,
  } = useGetDomainList(currentPage, pageSize, debouncedSearch);

  // Extract data from the response
  const domainData =
    domainResponse && "data" in domainResponse
      ? domainResponse.data.data || []
      : [];
  const paginationInfo =
    domainResponse && "data" in domainResponse
      ? domainResponse.data
      : {
          from: 0,
          to: 0,
          total: 0,
          last_page: 1,
        };
  const isDataEmpty = !domainData || domainData.length === 0;

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

  // Function to determine domain status based on expiration date
  const getDomainStatus = (domain: IDomainActual): DomainStatusEnum => {
    if (!domain.time_expired) return DomainStatusEnum.INACTIVE;

    const today = new Date();
    const expiry = new Date(domain.time_expired);

    // Calculate days until expiration
    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilExpiry < 0) return DomainStatusEnum.INACTIVE;
    if (domain.is_locked) return DomainStatusEnum.ACTIVE;

    return DomainStatusEnum.ACTIVE;
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
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
                className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder={t("placeholders.search")}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearch(e.target.value);
                }}
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
                      <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                        Domain
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.timestamp")}
                      </TableHead>
                      <TableHead className="w-[90px] py-3 font-medium text-gray-700">
                        Renew Deadline
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        Expires
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        Registrar
                      </TableHead>
                      <TableHead className="w-[90px] py-3 font-medium text-gray-700">
                        Security
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainData.map((domain: IDomainActual, index: number) => {
                      const domainStatus = getDomainStatus(domain);
                      return (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                            {domain.id}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            <span className="font-medium text-indigo-600">
                              {domain.domain || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <DomainStatusBadge status={domainStatus} />
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.updated_at
                              ? format(
                                  new Date(domain.updated_at),
                                  "yyyy-MM-dd, h:mm a"
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {format(
                              domain.renew_deadline,
                              "yyyy-MM-dd, h:mm a"
                            ) || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.time_expired
                              ? format(
                                  new Date(domain.time_expired),
                                  "yyyy-MM-dd"
                                )
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.registrar || "—"}
                          </TableCell>
                          <TableCell className="py-3">
                            {domain.is_locked ? (
                              <div className="flex items-center">
                                <Lock className="mr-1 h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-600">
                                  Locked
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <LockOpen className="mr-1 h-4 w-4 text-amber-600" />
                                <span className="text-xs text-amber-600">
                                  Unlocked
                                </span>
                              </div>
                            )}
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
