"use client";

import Link from "next/link";

import { Edit, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { IPaginationResponse, IUser } from "@/types/user.type";

import { formatDateTime } from "@/lib/utils";

import { useDebounce } from "@/hooks/use-debounce";
import { useGetUserList } from "@/hooks/user";

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
import { SearchInput } from "@/components/inputs/search-input";

export default function UsersDataTable() {
  const t = useTranslations("UserPage.table");

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

  // Extract data from the response with proper typing
  const userData = userResponse?.success ? userResponse.data.data : [];

  const paginationInfo = {
    total: userResponse?.success ? userResponse.data.total : 0,
    page: currentPage,
    pageSize: pageSize,
    totalPages: userResponse?.success ? userResponse.data.totalPages : 1,
  };

  const isDataEmpty = !userData || userData.length === 0;

  // Handle next page navigation
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.totalPages, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle previous page navigation
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="border-b border-gray-200 hover:bg-white">
                    <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                      {t("columns.id")}
                    </TableHead>
                    <TableHead className="w-[200px] py-3 font-medium text-gray-700">
                      {t("columns.name")}
                    </TableHead>
                    <TableHead className="w-[250px] py-3 font-medium text-gray-700">
                      {t("columns.email")}
                    </TableHead>
                    <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                      {t("columns.team")}
                    </TableHead>
                    <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                      {t("columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.map((user: IUser) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                        {user.id}
                      </TableCell>
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
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/users/edit/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">
                                {t("actions.edit")}
                              </span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">
                              {t("actions.delete")}
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Section */}
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

                {/* Pagination controls */}
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
                    disabled={currentPage === paginationInfo.totalPages}
                  >
                    {t("pagination.nextPage")}
                  </Button>
                </div>
              </div>

              {/* Bottom status line */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                <div>
                  {t("pagination.showing", {
                    from: (currentPage - 1) * pageSize + 1,
                    to: Math.min(currentPage * pageSize, paginationInfo.total),
                    total: paginationInfo.total,
                  })}
                </div>
                <div>
                  {t("pagination.page", {
                    current: currentPage,
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
