"use client";

import { useState } from "react";

import Link from "next/link";

import { DomainStatusEnum } from "@/enums/domain-status";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IDomainActual } from "@/types/domain.type";

import { formatDateTime } from "@/lib/utils";

import { useGetDomainList, useRefreshDomainList } from "@/hooks/domain";
import { useDebounce } from "@/hooks/use-debounce";

import { DomainStatusBadge } from "@/components/ui/badge/domain-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Local state for filters (before applying)
  const [localSearch, setLocalSearch] = useState(search);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(
    status !== "all" ? [status] : []
  );
  const [selectedLockStatus, setSelectedLockStatus] = useState<string[]>(
    isLocked !== "all" ? [isLocked] : []
  );
  const [selectedRenewable, setSelectedRenewable] = useState<string[]>(
    renewable !== "all" ? [renewable] : []
  );
  const [selectedRegistrar, setSelectedRegistrar] = useState<string[]>(
    registrar !== "all" ? [registrar] : []
  );
  const [selectedHasSites, setSelectedHasSites] = useState<string[]>(
    hasSites !== "all" ? [hasSites] : []
  );

  const debouncedSearch = useDebounce(search, 500);

  // Filter options
  const statusOptions = [
    { value: DomainStatusEnum.ACTIVE, label: t("filters.active") },
    { value: DomainStatusEnum.IN_USE, label: t("filters.inactive") },
    { value: DomainStatusEnum.CANCELLED, label: t("filters.cancelled") },
    {
      value: DomainStatusEnum.HELD_EXPIRED_REDEMPTION_MOCK,
      label: t("filters.heldExpiredRedemption"),
    },
    {
      value: DomainStatusEnum.PENDING_HOLD_REDEMPTION,
      label: t("filters.pendingHoldRedemption"),
    },
    {
      value: DomainStatusEnum.CANCELLED_REDEEMABLE,
      label: t("filters.cancelledRedeemable"),
    },
  ];

  const lockStatusOptions = [
    { value: "true", label: t("filters.locked") },
    { value: "false", label: t("filters.unlocked") },
  ];

  const renewableOptions = [
    { value: "true", label: t("filters.renewable") },
    { value: "false", label: t("filters.nonRenewable") },
  ];

  const hasSitesOptions = [
    { value: "true", label: t("filters.hasSites") },
    { value: "false", label: t("filters.noSites") },
  ];

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
    setSearch("");
    setStatus("all");
    setIsLocked("all");
    setRenewable("all");
    setRegistrar("all");
    setHasSites("all");
    setLocalSearch("");
    setSelectedStatus([]);
    setSelectedLockStatus([]);
    setSelectedRenewable([]);
    setSelectedRegistrar([]);
    setSelectedHasSites([]);
    setCurrentPage(1);
  };

  // Apply filters to URL
  const applyFilters = () => {
    setSearch(localSearch);
    setStatus(selectedStatus.length > 0 ? selectedStatus[0] : "all");
    setIsLocked(selectedLockStatus.length > 0 ? selectedLockStatus[0] : "all");
    setRenewable(selectedRenewable.length > 0 ? selectedRenewable[0] : "all");
    setRegistrar(selectedRegistrar.length > 0 ? selectedRegistrar[0] : "all");
    setHasSites(selectedHasSites.length > 0 ? selectedHasSites[0] : "all");
    setCurrentPage(1);
  };

  // Handle checkbox changes
  const handleStatusChange = (status: string, checked: boolean) => {
    setSelectedStatus(checked ? [status] : []);
  };

  const handleLockStatusChange = (lockStatus: string, checked: boolean) => {
    setSelectedLockStatus(checked ? [lockStatus] : []);
  };

  const handleRenewableChange = (renewable: string, checked: boolean) => {
    setSelectedRenewable(checked ? [renewable] : []);
  };

  const handleHasSitesChange = (hasSites: string, checked: boolean) => {
    setSelectedHasSites(checked ? [hasSites] : []);
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
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 items-end justify-end gap-4 md:grid-cols-3">
          <div>
            <Label
              className="text-foreground mb-2 block text-sm font-medium"
              htmlFor="search"
            >
              {t("filters.search")}
            </Label>
            <SearchInput
              className="w-full"
              placeholder={t("placeholders.search")}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tags Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  {t("filters.status")}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by Status
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {statusOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={option.value}
                          checked={selectedStatus.includes(option.value)}
                          onCheckedChange={(checked) =>
                            handleStatusChange(option.value, checked === true)
                          }
                        />
                        <label
                          htmlFor={option.value}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Lock Status Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  {t("filters.lockStatus")}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by Lock Status
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {lockStatusOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`lock-${option.value}`}
                          checked={selectedLockStatus.includes(option.value)}
                          onCheckedChange={(checked) =>
                            handleLockStatusChange(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        <label
                          htmlFor={`lock-${option.value}`}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Renewable Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  Renewable
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by Renewable
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {renewableOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`renewable-${option.value}`}
                          checked={selectedRenewable.includes(option.value)}
                          onCheckedChange={(checked) =>
                            handleRenewableChange(
                              option.value,
                              checked === true
                            )
                          }
                        />
                        <label
                          htmlFor={`renewable-${option.value}`}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Has Sites Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <span className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-0.5 text-sm font-medium transition-colors">
                  <PlusCircle className="size-3.5" />
                  Has Sites
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <div className="px-3 pt-3">
                  <h3 className="text-foreground text-sm font-medium">
                    Filter by Sites
                  </h3>
                </div>
                <ScrollArea className="max-h-72">
                  <div className="space-y-3 p-3">
                    {hasSitesOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`sites-${option.value}`}
                          checked={selectedHasSites.includes(option.value)}
                          onCheckedChange={(checked) =>
                            handleHasSitesChange(option.value, checked === true)
                          }
                        />
                        <label
                          htmlFor={`sites-${option.value}`}
                          className="text-foreground cursor-pointer text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-border flex items-center justify-between border-t p-3">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="h-8 px-3 text-sm"
          >
            {t("filters.clear")}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-grow">
        {isFetching || isRefreshing ? (
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
          <EmptyTable />
        ) : (
          <div className="flex flex-col">
            <div className="relative w-full overflow-auto">
              <Table className="w-full">
                <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                  <TableRow className="border-border hover:bg-muted/50 border-b">
                    <TableHead className="text-foreground w-[150px] py-3 font-medium">
                      {t("columns.domain")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.status")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.timestamp")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.renewDeadline")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.expires")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.registrar")}
                    </TableHead>
                    {/* <TableHead className="text-foreground w-[120px] py-3 font-medium">
                      {t("columns.actions")}
                    </TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainData.map((domain: IDomainActual, index: number) => {
                    const domainStatus = getDomainStatus(domain);
                    return (
                      <TableRow
                        key={index}
                        className="border-border hover:bg-muted/50 group border-b transition-colors"
                      >
                        <TableCell className="py-3">
                          <span className="text-foreground font-medium">
                            {domain.domain ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <DomainStatusBadge status={domainStatus} />
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {domain.updated_at
                            ? formatDateTime(new Date(domain.updated_at))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {domain.renew_deadline
                            ? formatDateTime(new Date(domain.renew_deadline))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {domain.time_expired
                            ? formatDateTime(new Date(domain.time_expired))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {domain.registrar ?? "—"}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
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
                    disabled={currentPage === paginationInfo.last_page}
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
