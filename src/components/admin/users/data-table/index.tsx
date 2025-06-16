"use client";

import Link from "next/link";

import { Ellipsis } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { IUser } from "@/types/user.type";

import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteUser, useGetUserList } from "@/hooks/user";

import { Button } from "@/components/ui/button";
import ConfirmationAlertDialog from "@/components/ui/dialogs/confirmation-alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

export default function UsersDataTable() {
  const t = useTranslations("UserPage.table");
  const deleteUser = useDeleteUser();

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
    data: userResponse,
    isFetching,
    isError,
    refetch,
  } = useGetUserList(currentPage, pageSize, debouncedSearch);

  // Extract data from the response based on the actual API structure
  const userData =
    userResponse?.success && userResponse?.data?.data
      ? userResponse.data.data
      : [];

  const paginationInfo = {
    total:
      userResponse?.success && userResponse?.data ? userResponse.data.total : 0,
    page:
      userResponse?.success && userResponse?.data
        ? userResponse.data.current_page
        : currentPage,
    pageSize:
      userResponse?.success && userResponse?.data
        ? userResponse.data.per_page
        : pageSize,
    totalPages:
      userResponse?.success && userResponse?.data
        ? userResponse.data.last_page
        : 1,
    from:
      userResponse?.success && userResponse?.data
        ? userResponse.data.from || 0
        : 0,
    to:
      userResponse?.success && userResponse?.data
        ? userResponse.data.to || 0
        : 0,
    hasNextPage:
      userResponse?.success && userResponse?.data
        ? !!userResponse.data.next_page_url
        : false,
    hasPreviousPage:
      userResponse?.success && userResponse?.data
        ? !!userResponse.data.prev_page_url
        : false,
  };

  const isDataEmpty = !userData || userData.length === 0;

  // Handle next page navigation
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.totalPages, prev + 1));
  };

  // Handle previous page navigation
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
    } catch (error: any) {
      toast.error(t("delete.error"), {
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput
          className="w-full sm:max-w-xs"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results Table or Empty State */}
      <div className="flex-grow">
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Spinner />
              <p className="mt-2 text-sm text-gray-500">{t("loading")}</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive text-sm">{t("error")}</p>
              <Button
                onClick={() => {
                  setCurrentPage(1);
                  refetch();
                }}
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
            {/* Data Table Section */}
            <div className="relative w-full overflow-auto">
              <Table className="w-full">
                <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                  <TableRow className="border-border hover:bg-muted/50 border-b">
                    <TableHead className="text-foreground w-[200px] py-3 font-medium">
                      {t("columns.name")}
                    </TableHead>
                    <TableHead className="text-foreground w-[250px] py-3 font-medium">
                      {t("columns.email")}
                    </TableHead>
                    <TableHead className="text-foreground w-[150px] py-3 font-medium">
                      {t("columns.team")}
                    </TableHead>
                    <TableHead className="text-foreground w-[60px] py-3 font-medium">
                      {t("columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.map((user: IUser) => (
                    <TableRow
                      key={user.email}
                      className="border-border hover:bg-muted/50 border-b transition-colors"
                    >
                      <TableCell className="py-3 text-sm font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 text-sm">
                        {user.team_name || "—"}
                      </TableCell>
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <Ellipsis className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[180px]"
                          >
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/users/${user.id}`}>
                                <span>{t("actions.edit")}</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ConfirmationAlertDialog
                              title={t("delete.title")}
                              description={t("delete.description")}
                              onConfirm={() => handleDeleteUser(user.id)}
                            >
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault();
                                }}
                              >
                                <span>{t("actions.delete")}</span>
                              </DropdownMenuItem>
                            </ConfirmationAlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Section */}
            <div className="border-border sticky bottom-0 mt-auto border-t">
              {/* Main pagination controls */}
              <div className="flex items-center justify-between px-4 py-2">
                {/* Results per page */}
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

                {/* Pagination controls */}
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
                    disabled={currentPage === paginationInfo.totalPages}
                  >
                    {t("pagination.nextPage")}
                  </Button>
                </div>
              </div>

              {/* Bottom status line */}
              <div className="border-border bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
                <div>
                  {t("pagination.showing", {
                    from: paginationInfo.from,
                    to: paginationInfo.to,
                    total: paginationInfo.total,
                  })}
                </div>
                <div>
                  {t("pagination.page", {
                    current: paginationInfo.page,
                    total: paginationInfo.totalPages,
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
