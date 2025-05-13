"use client";

import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { ITeam } from "@/types/team.type";
import { formatDateTime } from "@/lib/utils";
import { useGetTeamList } from "@/hooks/team";
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

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";
import { SearchInput } from "@/components/inputs/search-input";

export default function TeamsDataTable() {
  const t = useTranslations("TeamPage.table");

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
    data: teamResponse,
    isFetching,
    isError,
    refetch,
  } = useGetTeamList(currentPage, pageSize, debouncedSearch);

  const teamData = teamResponse?.success ? teamResponse.data.data : [];

  const paginationInfo = {
    total: teamResponse?.success ? teamResponse.data.total : 0,
    page: currentPage,
    pageSize: pageSize,
    totalPages: teamResponse?.success ? teamResponse.data.totalPages : 1,
  };

  const isDataEmpty = !teamData || teamData.length === 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.totalPages, prev + 1));
    
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    
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
                    <TableHead className="w-[60px] py-3 font-medium text-gray-700">
                      {t("columns.id")}
                    </TableHead>
                    <TableHead className="w-[180px] py-3 font-medium text-gray-700">
                      {t("columns.name")}
                    </TableHead>
                    <TableHead className="w-[200px] py-3 font-medium text-gray-700">
                      {t("columns.permissions")}
                    </TableHead>
                    <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                      {t("columns.createdAt")}
                    </TableHead>
                    <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                      {t("columns.updatedAt")}
                    </TableHead>
                    <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                      {t("columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData.map((team: ITeam) => (
                    <TableRow
                      key={team.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                        {team.id}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium">
                        {team.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {team.permissions.length > 0 ? (
                            team.permissions
                              .slice(0, 3)
                              .map((permission: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                                >
                                  {permission.split("_").slice(-1)[0]}
                                </span>
                              ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {team.permissions.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              +{team.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 text-sm">
                        {team.created_at
                          ? formatDateTime(new Date(team.created_at))
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 text-sm">
                        {team.updated_at
                          ? formatDateTime(new Date(team.updated_at))
                          : "—"}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/teams/edit/${team.id}`}>
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
