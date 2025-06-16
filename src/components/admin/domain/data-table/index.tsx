"use client";

import { useState } from "react";

import Link from "next/link";

import { DomainStatusEnum } from "@/enums/domain-status";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IDomainActual } from "@/types/domain.type";

import { formatDateTime } from "@/lib/utils";

import { useGetDomainList, useRefreshDomainList } from "@/hooks/domain";
import { useDebounce } from "@/hooks/use-debounce";

import { DomainStatusBadge } from "@/components/ui/badge/domain-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/inputs/search-input";
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
      ? {
          from:
            (domainResponse.data.current_page - 1) *
              domainResponse.data.per_page +
            1,
          to: Math.min(
            domainResponse.data.current_page * domainResponse.data.per_page,
            domainResponse.data.total
          ),
          total: domainResponse.data.total,
          last_page: Math.ceil(
            domainResponse.data.total / domainResponse.data.per_page
          ),
        }
      : {
          from: 0,
          to: 0,
          total: 0,
          last_page: 1,
        };
  const isDataEmpty = !domainData || domainData.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
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
    if (domain.sites) {
      return DomainStatusEnum.IN_USE;
    }

    if (
      Object.values(DomainStatusEnum).includes(
        domain.status as DomainStatusEnum
      )
    ) {
      return domain.status as DomainStatusEnum;
    }

    return DomainStatusEnum.IN_USE;
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
              <SelectItem value={DomainStatusEnum.IN_USE}>
                {t("filters.inactive")}
              </SelectItem>
              <SelectItem value={DomainStatusEnum.CANCELLED}>
                {t("filters.cancelled")}
              </SelectItem>
              <SelectItem value={DomainStatusEnum.HELD_EXPIRED_REDEMPTION_MOCK}>
                {t("filters.heldExpiredRedemption")}
              </SelectItem>
              <SelectItem value={DomainStatusEnum.PENDING_HOLD_REDEMPTION}>
                {t("filters.pendingHoldRedemption")}
              </SelectItem>
              <SelectItem value={DomainStatusEnum.CANCELLED_REDEEMABLE}>
                {t("filters.cancelledRedeemable")}
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
                <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                  <TableRow className="border-border hover:bg-muted/50 border-b">
                    <TableHead className="text-foreground w-[140px] py-3 font-medium">
                      {t("columns.domain")}
                    </TableHead>
                    <TableHead className="text-foreground w-[120px] py-3 font-medium">
                      {t("columns.status")}
                    </TableHead>
                    <TableHead className="text-foreground w-[120px] py-3 font-medium">
                      {t("columns.timestamp")}
                    </TableHead>
                    <TableHead className="text-foreground w-[90px] py-3 font-medium">
                      {t("columns.renewDeadline")}
                    </TableHead>
                    <TableHead className="text-foreground w-[120px] py-3 font-medium">
                      {t("columns.expires")}
                    </TableHead>
                    <TableHead className="text-foreground w-[120px] py-3 font-medium">
                      {t("columns.registrar")}
                    </TableHead>
                    <TableHead className="text-foreground w-[120px] py-3 font-medium">
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
                        className="border-border hover:bg-muted/50 border-b transition-colors"
                      >
                        <TableCell className="py-3">
                          <span className="text-primary font-medium">
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
                            <Link
                              href={`/studio/sites/${domain.sites?.id}/pages`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                              })}
                            >
                              {t("actions.edit")}
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="border-border sticky bottom-0 mt-auto border-t px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm">
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
                    disabled={currentPage === paginationInfo.last_page}
                  >
                    {t("pagination.nextPage")}
                  </Button>
                </div>
              </div>

              <div className="border-border bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
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
