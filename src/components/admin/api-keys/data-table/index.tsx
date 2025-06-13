"use client";

import { useMemo, useState } from "react";

import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IApiKey } from "@/types/api-key.type";

import { formatDateTime } from "@/lib/utils";

import { useGetApiKeys } from "@/hooks/api-key";
import { useDebounce } from "@/hooks/use-debounce";

import { ApiKeyStatusBadge } from "@/components/ui/badge/api-key-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

  const debouncedSearch = useDebounce(search, 300);

  const { data: apiKeysResponse, isLoading, isError } = useGetApiKeys();

  const apiKeysData = apiKeysResponse?.data ?? [];

  // Frontend filtering and pagination
  const filteredData = useMemo(() => {
    if (!apiKeysData) return [];

    return apiKeysData.filter((apiKey: IApiKey) => {
      const searchLower = debouncedSearch.toLowerCase();
      return (
        apiKey.name.toLowerCase().includes(searchLower) ||
        apiKey.key_prefix.toLowerCase().includes(searchLower)
      );
    });
  }, [apiKeysData, debouncedSearch]);

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
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="w-1/2">
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
        </div>

        <div className="mt-4 flex-grow">
          {isDataEmpty ? (
            <EmptyTable />
          ) : (
            <div className="flex flex-col">
              <div className="relative w-full overflow-auto">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                        {t("columns.name")}
                      </TableHead>
                      <TableHead className="w-[200px] py-3 font-medium text-gray-700">
                        {t("columns.apiKey")}
                      </TableHead>
                      <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                        {t("columns.status")}
                      </TableHead>
                      <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                        {t("columns.lastUsed")}
                      </TableHead>
                      <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                        {t("columns.expiresAt")}
                      </TableHead>
                      <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                        {t("columns.createdAt")}
                      </TableHead>
                      <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                        {t("columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((apiKey: IApiKey) => {
                      const isKeyVisible = visibleKeys[apiKey.id] || false;

                      return (
                        <TableRow
                          key={apiKey.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-muted-foreground py-3">
                            <span className="font-medium text-indigo-600">
                              {apiKey.name}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <code className="text-muted-foreground rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                                {formatApiKey(apiKey.key_prefix, isKeyVisible)}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <ApiKeyStatusBadge apiKey={apiKey} />
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {apiKey.last_used_at
                              ? formatDateTime(new Date(apiKey.last_used_at))
                              : t("status.never")}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {apiKey.expires_at
                              ? formatDateTime(new Date(apiKey.expires_at))
                              : t("status.never")}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
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

              <div className="sticky bottom-0 mt-auto border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {t("pagination.rowsPerPage")}
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-auto border-gray-200 text-sm">
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
                      disabled={currentPage === totalPages}
                    >
                      {t("pagination.nextPage")}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  <div>
                    {t("pagination.viewing")}{" "}
                    {filteredData.length > 0 ? from : 0}-{to}{" "}
                    {t("pagination.of")} {filteredData.length}{" "}
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
    </div>
  );
}
