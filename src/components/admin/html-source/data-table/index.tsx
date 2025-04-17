"use client";

import { useState } from "react";

import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

// Import types
import { IHtmlSource } from "@/types/html-source.type";

import { formatDateTime } from "@/lib/utils";

// Import real hook instead of using mock implementation
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

import { SearchBar } from "./search-bar";

// Mock Data
const mockApplications = [
  { value: "app1", label: "Mobile App" },
  { value: "app2", label: "Web App" },
  { value: "app3", label: "Desktop App" },
];

const mockNations = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "vn", label: "Vietnam" },
];

const mockPlatforms = [
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "web", label: "Web" },
  { value: "desktop", label: "Desktop" },
];

const mockData: IHtmlSource[] = [
  {
    id: "1",
    pathway: "home/products",
    nation: "us",
    platform: "android",
    source: "organic",
    device: "mobile",
    application_id: "app1",
    version: "1.0.5",
    day_creation: "2023-10-15T14:22:00Z",
    note: "Home page to products list navigation",
  },
  {
    id: "2",
    pathway: "products/detail",
    nation: "uk",
    platform: "ios",
    source: "campaign",
    device: "tablet",
    application_id: "app1",
    version: "1.0.6",
    day_creation: "2023-10-16T09:15:30Z",
    note: "Product detail page view",
  },
  {
    id: "3",
    pathway: "checkout/complete",
    nation: "ca",
    platform: "web",
    source: "direct",
    device: "desktop",
    application_id: "app2",
    version: "2.1.0",
    day_creation: "2023-10-17T16:40:12Z",
    note: "Checkout completion",
  },
  {
    id: "4",
    pathway: "account/settings",
    nation: "vn",
    platform: "web",
    source: "referral",
    device: "mobile",
    application_id: "app2",
    version: "2.1.2",
    day_creation: "2023-10-18T11:05:22Z",
    note: "Account settings update",
  },
  {
    id: "5",
    pathway: "blog/article",
    nation: "us",
    platform: "android",
    source: "social",
    device: "mobile",
    application_id: "app3",
    version: "3.0.1",
    day_creation: "2023-10-19T14:30:45Z",
    note: "Blog article view",
  },
];

// Mock response
const createMockResponse = (page: number, pageSize: number, search: string) => {
  const filteredData = search
    ? mockData.filter(
        (item) =>
          item.pathway?.toLowerCase().includes(search.toLowerCase()) ||
          item.source?.toLowerCase().includes(search.toLowerCase()) ||
          item.nation?.toLowerCase().includes(search.toLowerCase()) ||
          item.platform?.toLowerCase().includes(search.toLowerCase()) ||
          item.device?.toLowerCase().includes(search.toLowerCase()) ||
          item.application_id?.toLowerCase().includes(search.toLowerCase())
      )
    : mockData;

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return {
    data: {
      current_page: page,
      data: paginatedData,
      from: (page - 1) * pageSize + 1,
      to: Math.min(page * pageSize, filteredData.length),
      total: filteredData.length,
      last_page: Math.ceil(filteredData.length / pageSize),
      per_page: pageSize,
    },
    success: true,
    message: "HTML source data fetched successfully",
  };
};

export default function HtmlSourceDataTable() {
  const t = useTranslations("HtmlSourcePage.table");
  const [isLoading, setIsLoading] = useState(false);

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

  // Use mock data instead of real API call
  const mockResponse = createMockResponse(
    currentPage,
    pageSize,
    debouncedSearch
  );
  const isFetching = isLoading;
  const isError = false;
  const refetch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Extract data from the mock response
  const htmlSourceData = mockResponse.data.data;
  const paginationInfo = mockResponse.data;
  const isDataEmpty = !htmlSourceData || htmlSourceData.length === 0;

  // Handle next page navigation - increment by 1
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle previous page navigation - decrement by 1
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle advanced search
  const handleAdvancedSearch = (values: any) => {
    console.log("Advanced search values:", values);

    // Create a combined search string based on the values
    let searchStr = "";
    if (values.sourceKeyword) searchStr += values.sourceKeyword;
    if (values.device) searchStr += " " + values.device;
    if (values.platform && values.platform !== "all")
      searchStr += " " + values.platform;
    if (values.nation && values.nation !== "all")
      searchStr += " " + values.nation;
    if (values.application && values.application !== "all")
      searchStr += " " + values.application;

    setSearch(searchStr.trim());
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Filters Section */}
      <div className="space-y-6">
        <div className="">
          <SearchBar
            onSearch={handleAdvancedSearch}
            applications={mockApplications}
            nations={mockNations}
            platforms={mockPlatforms}
          />
        </div>

        {/* Results Table or Empty State */}
        <div className="mt-4 flex-grow">
          {isFetching ? (
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
              </div>
            </div>
          ) : isDataEmpty ? (
            <EmptyTable />
          ) : (
            <div className="flex flex-col space-y-6">
              {/* First Data Table Section */}
              <div className="relative w-full overflow-auto">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[60px] py-3 font-medium text-gray-700">
                        {t("columns.id")}
                      </TableHead>
                      <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                        {t("columns.pathway")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.nation")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.platform")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.source")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.device")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.applicationId")}
                      </TableHead>
                      <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                        {t("columns.version")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {htmlSourceData.map(
                      (source: IHtmlSource, index: number) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                            {source.id ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3">
                            <span className="font-medium text-indigo-600">
                              {source.pathway ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.nation ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.platform ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.source ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.device ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.application_id ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.version ?? "—"}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Second Data Table Section */}
              <div className="relative w-full overflow-auto">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                        {t("columns.dayCreation")}
                      </TableHead>
                      <TableHead className="py-3 font-medium text-gray-700">
                        {t("columns.note")}
                      </TableHead>
                      <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                        {t("columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {htmlSourceData.map(
                      (source: IHtmlSource, index: number) => (
                        <TableRow
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.day_creation
                              ? formatDateTime(new Date(source.day_creation))
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-3 text-sm">
                            {source.note ?? "—"}
                          </TableCell>
                          <TableCell className="py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">
                                {t("actions.details")}
                              </span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Section - Fixed at bottom when scrolling */}
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
                      disabled={currentPage === paginationInfo.last_page}
                    >
                      {t("pagination.nextPage")}
                    </Button>
                  </div>
                </div>

                {/* Bottom status line */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  <div>
                    Viewing {paginationInfo.from || 1}-
                    {paginationInfo.to ||
                      Math.min(pageSize, paginationInfo.total || 0)}{" "}
                    {t("pagination.of")} {paginationInfo.total || 0} results
                  </div>
                  <div>
                    Page {currentPage} {t("pagination.of")}{" "}
                    {paginationInfo.last_page || 1}
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

