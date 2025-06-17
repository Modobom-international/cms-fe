"use client";

import { useMemo, useState } from "react";

import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IApiKey } from "@/types/api-key.type";

import { formatDateTime } from "@/lib/utils";

import { useGetApiKeys } from "@/hooks/api-key";
import { useDebounce } from "@/hooks/use-debounce";

import { ApiKeyStatusBadge } from "@/components/ui/badge/api-key-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import DeleteApiKeyDialog from "@/components/admin/api-keys/dialogs/delete-api-key-dialog";
import UpdateApiKeyDialog from "@/components/admin/api-keys/dialogs/update-api-key-dialog";
import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

export default function ApiKeyDataTable() {
  const t = useTranslations("ApiKeyPage.table");

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
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all")
  );

  // Local state for filters (before applying)
  const [localSearch, setLocalSearch] = useState(search);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    statusFilter !== "all" ? [statusFilter] : []
  );

  const debouncedSearch = useDebounce(search, 300);

  // Filter options
  const statusOptions = [
    { value: "active", label: t("status.active") },
    { value: "inactive", label: t("status.inactive") },
    { value: "expired", label: t("status.expired") },
  ];

  const { data: apiKeysResponse, isLoading, isError } = useGetApiKeys();

  const apiKeysData = apiKeysResponse?.data;

  // Frontend filtering and pagination
  const filteredData = useMemo(() => {
    if (!apiKeysData) return [];

    return apiKeysData.filter((apiKey: IApiKey) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        apiKey.name.toLowerCase().includes(searchLower) ||
        apiKey.key_prefix.toLowerCase().includes(searchLower);

      // Status filtering
      let matchesStatus = true;
      if (statusFilter !== "all") {
        const isExpired =
          apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
        const isActive = apiKey.is_active && !isExpired;

        switch (statusFilter) {
          case "active":
            matchesStatus = isActive;
            break;
          case "inactive":
            matchesStatus = !apiKey.is_active;
            break;
          case "expired":
            matchesStatus = !!isExpired;
            break;
          default:
            matchesStatus = true;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [apiKeysData, debouncedSearch, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, filteredData.length);

  const isDataEmpty = !paginatedData || paginatedData.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Apply filters to URL
  const applyFilters = () => {
    setSearch(localSearch);
    setStatusFilter(selectedStatuses.length > 0 ? selectedStatuses[0] : "all");
    setCurrentPage(1);
  };

  // Handle checkbox changes
  const handleStatusChange = (status: string, checked: boolean) => {
    setSelectedStatuses(checked ? [status] : []);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setLocalSearch("");
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  const formatApiKey = (keyPrefix: string, isVisible: boolean) => {
    if (isVisible) {
      return `${keyPrefix}${"*".repeat(32)}`;
    }
    return `${keyPrefix.substring(0, 8)}${"*".repeat(24)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (isError || !apiKeysResponse) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-destructive text-sm">{t("loadingStates.error")}</p>
        </div>
      </div>
    );
  }

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
                  Status
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
                          checked={selectedStatuses.includes(option.value)}
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

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="h-8 px-3 text-sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-6 flex-grow">
        {isDataEmpty ? (
          <EmptyTable />
        ) : (
          <div className="flex flex-col">
            <div className="relative w-full overflow-auto">
              <Table className="w-full">
                <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                  <TableRow className="border-border hover:bg-muted/50 border-b">
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.name")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.apiKey")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.status")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.lastUsed")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.expiresAt")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.createdAt")}
                    </TableHead>
                    <TableHead className="text-foreground py-3 font-medium">
                      {t("columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((apiKey: IApiKey) => {
                    return (
                      <TableRow
                        key={apiKey.id}
                        className="group border-border border-b"
                      >
                        <TableCell className="py-3">
                          <span className="text-foreground font-medium">
                            {apiKey.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <code className="bg-accent text-foreground rounded px-2 py-1 font-mono text-xs">
                              {formatApiKey(apiKey.key_prefix, false)}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <ApiKeyStatusBadge apiKey={apiKey} />
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {apiKey.last_used_at
                            ? formatDateTime(new Date(apiKey.last_used_at))
                            : t("status.never")}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {apiKey.expires_at
                            ? formatDateTime(new Date(apiKey.expires_at))
                            : t("status.never")}
                        </TableCell>
                        <TableCell className="text-foreground py-3 text-sm">
                          {apiKey.created_at
                            ? formatDateTime(new Date(apiKey.created_at))
                            : "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">
                                  {t("actions.title")}
                                </span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {t("actions.title")}
                              </DropdownMenuLabel>

                              <UpdateApiKeyDialog
                                apiKey={apiKey}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    {t("actions.edit")}
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuSeparator />
                              <DeleteApiKeyDialog
                                apiKey={apiKey}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive hover:!bg-destructive/10"
                                  >
                                    {t("actions.delete")}
                                  </DropdownMenuItem>
                                }
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="sticky bottom-0 mt-auto border-t">
              <div className="bg-background dark:bg-card flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {t("pagination.rowsPerPage")}
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="border-border h-8 w-auto text-sm">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
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
                    disabled={currentPage === totalPages}
                  >
                    {t("pagination.nextPage")}
                  </Button>
                </div>
              </div>

              <div className="text-muted-foreground bg-muted flex items-center justify-between border-t px-4 py-2 text-xs">
                <div>
                  {t("pagination.viewing")} {filteredData.length > 0 ? from : 0}
                  -{to} {t("pagination.of")} {filteredData.length}{" "}
                  {t("pagination.results")}
                </div>
                <div>
                  {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
                  {totalPages}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
