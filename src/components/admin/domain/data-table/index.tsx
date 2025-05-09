"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { DomainStatusEnum } from "@/enums/domain-status";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

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

import { RefreshDialog } from "@/components/admin/domain/data-table/dialog";
import { DomainStatusBadge } from "@/components/badge/domain-status-badge";
import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";
import { SearchInput } from "@/components/inputs/search-input";

export default function DomainDataTable() {
  const t = useTranslations("DomainPage.table");
  const router = useRouter();
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
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("all")
  );
  const [isLocked, setIsLocked] = useQueryState(
    "is_locked",
    parseAsString.withDefault("all")
  );
  const [renewable, setRenewable] = useQueryState(
    "renewable",
    parseAsString.withDefault("all")
  );
  const [registrar, setRegistrar] = useQueryState(
    "registrar",
    parseAsString.withDefault("all")
  );
  const [hasSites, setHasSites] = useQueryState(
    "has_sites",
    parseAsString.withDefault("all")
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: domainResponse,
    isFetching,
    isError,
    refetch,
  } = useGetDomainList({
    page: currentPage,
    pageSize,
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    is_locked: isLocked === "all" ? undefined : isLocked === "true",
    renewable: renewable === "all" ? undefined : renewable === "true",
    registrar: registrar === "all" ? undefined : registrar,
    has_sites: hasSites === "all" ? undefined : hasSites === "true",
  });

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

  const handleClearFilters = () => {
    setStatus("all");
    setIsLocked("all");
    setRenewable("all");
    setRegistrar("all");
    setHasSites("all");
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("placeholders.search")}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value={DomainStatusEnum.ACTIVE}>
                {t("filters.active")}
              </SelectItem>
              <SelectItem value={DomainStatusEnum.INACTIVE}>
                {t("filters.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={isLocked} onValueChange={setIsLocked}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.lockStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="true">{t("filters.locked")}</SelectItem>
              <SelectItem value="false">{t("filters.unlocked")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={renewable} onValueChange={setRenewable}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.renewable")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="true">{t("filters.renewable")}</SelectItem>
              <SelectItem value="false">{t("filters.nonRenewable")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={hasSites} onValueChange={setHasSites}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filters.hasSites")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="true">{t("filters.hasSites")}</SelectItem>
              <SelectItem value="false">{t("filters.noSites")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="h-10"
          >
            {t("filters.clear")}
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="mt-4 flex-grow">
        {isFetching || isRefreshing ? (
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
                    <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                      {t("columns.domain")}
                    </TableHead>
                    <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                      {t("columns.status")}
                    </TableHead>
                    <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                      {t("columns.timestamp")}
                    </TableHead>
                    <TableHead className="w-[90px] py-3 font-medium text-gray-700">
                      {t("columns.renewDeadline")}
                    </TableHead>
                    <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                      {t("columns.expires")}
                    </TableHead>
                    <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                      {t("columns.registrar")}
                    </TableHead>
                    <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                      {t("columns.actions")}
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
                        <TableCell className="text-muted-foreground py-3 text-sm">
                          {domain.sites && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                router.push(
                                  `/studio/sites/${domain.sites?.id}/pages`
                                );
                              }}
                            >
                              {t("actions.view")}
                            </Button>
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
                  {t("pagination.viewing")} {paginationInfo.from || 1}-
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
