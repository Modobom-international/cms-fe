"use client";

import { DomainStatusEnum } from "@/enums/domain-status";
import { Lock, LockOpen, RefreshCw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

import { IDomainActual } from "@/types/domain.type";

import { formatDateTime } from "@/lib/utils";

import { useGetDomainList, useRefreshDomainList } from "@/hooks/domain";
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
import { SearchInput } from "@/components/inputs/search-input";
import { RefreshDialog } from "@/components/admin/domain/data-table/dialog";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: domainResponse,
    isFetching,
    isError,
    refetch,
  } = useGetDomainList(currentPage, pageSize, debouncedSearch);

  const { mutate: refreshDomains, isPending: isRefreshing } =
    useRefreshDomainList();

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

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setIsModalOpen(true);
  };

  const getDomainStatus = (domain: IDomainActual): DomainStatusEnum => {
    if (!domain.time_expired) return DomainStatusEnum.INACTIVE;

    const today = new Date();
    const expiry = new Date(domain.time_expired);

    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilExpiry < 0) return DomainStatusEnum.INACTIVE;
    if (domain.is_locked) return DomainStatusEnum.ACTIVE;

    return DomainStatusEnum.ACTIVE;
  };

  return (
    <div className="flex flex-col">
      {/* Bộ lọc */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="search"
            >
              {t("filters.search")}
            </label>
            <SearchInput
              type="text"
              id="search"
              value={search}
              placeholder={t("placeholders.search")}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="h-10"
              disabled={isFetching || isRefreshing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("actions.refresh")}
            </Button>
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
                            {domain.id ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            <span className="font-medium text-indigo-600">
                              {domain.domain ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <DomainStatusBadge status={domainStatus} />
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.updated_at
                              ? formatDateTime(new Date(domain.updated_at))
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.renew_deadline
                              ? formatDateTime(new Date(domain.renew_deadline))
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.time_expired
                              ? formatDateTime(new Date(domain.time_expired))
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {domain.registrar ?? "—"}
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
                    Đang xem {paginationInfo.from || 1}-
                    {paginationInfo.to ||
                      Math.min(pageSize, paginationInfo.total || 0)}{" "}
                    {t("pagination.of")} {paginationInfo.total || 0} kết quả
                  </div>
                  <div>
                    Trang {currentPage} {t("pagination.of")}{" "}
                    {paginationInfo.last_page || 1}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RefreshDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        refreshDomains={refreshDomains}
        isRefreshing={isRefreshing}
        refetch={refetch}
      />
    </div>
  );
}