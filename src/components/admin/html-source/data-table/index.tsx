"use client";

import { useState } from "react";

import { CalendarDate, parseDate } from "@internationalized/date";
import { format } from "date-fns";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { DatePicker } from "react-aria-components";

// Import types
import { IHtmlSource } from "@/types/html-source.type";

import { formatDateTime } from "@/lib/utils";

import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/datefield-rac";
import { Input } from "@/components/ui/input";
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

import { EmptyTable } from "@/components/data-table/empty-table";
import { Spinner } from "@/components/global/spinner";

export default function HtmlSourceDataTable() {
  const t = useTranslations("HtmlSourcePage.table");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null
  );
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

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
  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(format(new Date(), "yyyy-MM-dd"))
  );

  const debouncedSearch = useDebounce(search, 500);

  // Extract data from the mock response
  const htmlSourceData: IHtmlSource[] = [];
  const paginationInfo = {
    from: 0,
    to: 0,
    total: 0,
    last_page: 1,
    current_page: 1,
  };
  const isDataEmpty = true;
  const isFetching = isLoading;
  const isError = false;

  // Handle next page navigation - increment by 1
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(paginationInfo.last_page, prev + 1));
  };

  // Handle previous page navigation - decrement by 1
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // Date picker handling
  const calendarDate = date ? parseDate(date) : undefined;
  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDate(newDate.toString());
    } else {
      setDate("");
    }
  };

  // Clear a specific filter
  const clearFilter = (type: "application" | "nation" | "platform") => {
    if (type === "application") setSelectedApplication(null);
    if (type === "nation") setSelectedNation(null);
    if (type === "platform") setSelectedPlatform(null);
  };

  return (
    <div className="flex flex-col">
      {/* Filters Section */}
      <div className="space-y-4">
        {/* First Row - Source Keyword */}
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
          {/* Source Keyword Input */}
          <div>
            <Label
              className="text-foreground mb-2 block text-sm font-medium"
              htmlFor="search"
            >
              {t("filters.search")}
            </Label>
            <Input
              id="search"
              placeholder={t("placeholders.search")}
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Second Row - Filter Pills and Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                <PlusCircle className="size-3.5" />
                {t("filters.date")}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="px-3 pt-3">
                <h3 className="text-sm font-medium">Select Date</h3>
              </div>
              <ScrollArea className="max-h-72">
                <div className="p-3">
                  <DatePicker value={calendarDate} onChange={handleDateChange}>
                    <DateInput className="w-full" />
                  </DatePicker>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between border-t border-gray-100 p-3">
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Application Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                <PlusCircle className="size-3.5" />
                Application
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="px-3 pt-3">
                <h3 className="text-sm font-medium">Filter by Application</h3>
              </div>
              <ScrollArea className="max-h-72">
                <div className="p-3">
                  <Select
                    onValueChange={(value) => setSelectedApplication(value)}
                    value={selectedApplication || undefined}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app1">Mobile App</SelectItem>
                      <SelectItem value="app2">Web App</SelectItem>
                      <SelectItem value="app3">Desktop App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between border-t border-gray-100 p-3">
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Nation Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                <PlusCircle className="size-3.5" />
                Nation
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="px-3 pt-3">
                <h3 className="text-sm font-medium">Filter by Nation</h3>
              </div>
              <ScrollArea className="max-h-72">
                <div className="p-3">
                  <Select
                    onValueChange={(value) => setSelectedNation(value)}
                    value={selectedNation || undefined}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select nation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="vn">Vietnam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between border-t border-gray-100 p-3">
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Platform Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2.5 py-0.5 text-sm font-medium text-gray-500 hover:bg-gray-50">
                <PlusCircle className="size-3.5" />
                Platform
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="px-3 pt-3">
                <h3 className="text-sm font-medium">Filter by Platform</h3>
              </div>
              <ScrollArea className="max-h-72">
                <div className="p-3">
                  <Select
                    onValueChange={(value) => setSelectedPlatform(value)}
                    value={selectedPlatform || undefined}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between border-t border-gray-100 p-3">
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Active Filters - Only show if selected */}
          {selectedApplication && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">
              {selectedApplication === "app1"
                ? "Mobile App"
                : selectedApplication === "app2"
                  ? "Web App"
                  : "Desktop App"}
              <button
                onClick={() => clearFilter("application")}
                className="ml-1 text-indigo-500 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          )}

          {selectedNation && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
              {selectedNation === "us"
                ? "United States"
                : selectedNation === "uk"
                  ? "United Kingdom"
                  : selectedNation === "ca"
                    ? "Canada"
                    : "Vietnam"}
              <button
                onClick={() => clearFilter("nation")}
                className="ml-1 text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </span>
          )}

          {selectedPlatform && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
              {selectedPlatform === "android"
                ? "Android"
                : selectedPlatform === "ios"
                  ? "iOS"
                  : selectedPlatform === "web"
                    ? "Web"
                    : "Desktop"}
              <button
                onClick={() => clearFilter("platform")}
                className="ml-1 text-amber-500 hover:text-amber-700"
              >
                ×
              </button>
            </span>
          )}
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
                  <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                    <TableRow className="border-border hover:bg-muted/50 border-b">
                      <TableHead className="text-foreground w-[60px] py-3 font-medium">
                        {t("columns.id")}
                      </TableHead>
                      <TableHead className="text-foreground w-[140px] py-3 font-medium">
                        {t("columns.pathway")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.nation")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.platform")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.source")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.device")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.applicationId")}
                      </TableHead>
                      <TableHead className="text-foreground w-[120px] py-3 font-medium">
                        {t("columns.version")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {htmlSourceData.map(
                      (source: IHtmlSource, index: number) => (
                        <TableRow
                          key={index}
                          className="border-border hover:bg-muted/50 border-b transition-colors"
                        >
                          <TableCell className="text-muted-foreground py-3 text-sm font-medium">
                            {source.id ?? "—"}
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-primary font-medium">
                              {source.pathway ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {source.nation ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {source.platform ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {source.source ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {source.device ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {source.application_id ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
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
                  <TableHeader className="bg-background dark:bg-card sticky top-0 z-10">
                    <TableRow className="border-border hover:bg-muted/50 border-b">
                      <TableHead className="text-foreground w-[140px] py-3 font-medium">
                        {t("columns.dayCreation")}
                      </TableHead>
                      <TableHead className="text-foreground py-3 font-medium">
                        {t("columns.note")}
                      </TableHead>
                      <TableHead className="text-foreground w-[100px] py-3 font-medium">
                        {t("columns.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {htmlSourceData.map(
                      (source: IHtmlSource, index: number) => (
                        <TableRow
                          key={index}
                          className="border-border hover:bg-muted/50 border-b transition-colors"
                        >
                          <TableCell className="py-3 text-sm">
                            {source.day_creation
                              ? formatDateTime(new Date(source.day_creation))
                              : "—"}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
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
              <div className="border-border bg-background dark:bg-card sticky bottom-0 mt-auto border-t">
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
                      disabled={currentPage === paginationInfo.last_page}
                    >
                      {t("pagination.nextPage")}
                    </Button>
                  </div>
                </div>

                {/* Bottom status line */}
                <div className="border-border bg-muted text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
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
