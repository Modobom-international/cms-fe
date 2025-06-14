"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IServer } from "@/types/server.type";

import { formatDateTime } from "@/lib/utils";

import { useGetServerList } from "@/hooks/server";
import { useDebounce } from "@/hooks/use-debounce";

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

import DeleteServerDialog from "@/components/admin/servers/dialogs/delete-server-dialog";
import UpdateServerDialog from "@/components/admin/servers/dialogs/update-server-dialog";
import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

interface RefreshDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refreshServers: () => void;
  isRefreshing: boolean;
  refetch: () => void;
}

export default function ServerDataTable() {
  const t = useTranslations("ServerPage.table");

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

  const debouncedSearch = useDebounce(search, 1000);

  const {
    data: serverResponse,
    isFetching,
    isError,
    error,
  } = useGetServerList(currentPage, pageSize, debouncedSearch);

  const serverData = serverResponse?.data?.data ?? [];
  const paginationInfo = serverResponse?.data ?? {
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
    current_page: 1,
  };
  const isDataEmpty = !serverData || serverData.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page ?? 1, prev + 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="flex flex-col">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="w-1/2">
            <label
              className="text-foreground mb-2 block text-sm font-medium"
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
                        {t("columns.name")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.ip")}
                      </TableHead>
                      <TableHead className="text-foreground w-[150px] py-3 font-medium">
                        {t("columns.createdAt")}
                      </TableHead>
                      <TableHead className="text-foreground w-[150px] py-3 font-medium">
                        {t("columns.updatedAt")}
                      </TableHead>
                      <TableHead className="text-foreground w-[100px] py-3 font-medium">
                        {t("columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serverData.map((server: IServer, index: number) => (
                      <TableRow
                        key={server.id}
                        className="border-border hover:bg-muted/50 border-b transition-colors"
                      >
                        <TableCell className="py-3">
                          <span className="text-primary font-medium">
                            {server.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">{server.ip}</TableCell>
                        <TableCell className="py-3 text-sm">
                          {server.created_at
                            ? formatDateTime(new Date(server.created_at))
                            : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-sm">
                          {server.updated_at
                            ? formatDateTime(new Date(server.updated_at))
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
                              <UpdateServerDialog
                                server={server}
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    {t("actions.edit")}
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuSeparator />
                              <DeleteServerDialog
                                server={server}
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-border sticky bottom-0 mt-auto border-t">
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
    </div>
  );
}
