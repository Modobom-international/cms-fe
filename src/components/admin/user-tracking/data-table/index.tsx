"use client";

import { CalendarDate, parseDate } from "@internationalized/date";
import {
  CalendarIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Map,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsIndex, parseAsString, useQueryState } from "nuqs";
import {
  Button as ButtonAria,
  DatePicker,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
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

// Define type for user tracking records
interface UserRecord {
  id: string;
  timestamp: string;
  ip: string;
  device: "Mobile" | "Tablet" | "Desktop" | string;
  location?: string;
  browser?: string;
}

// Sample data for user tracking
const userTrackingData: UserRecord[] = [];

export default function UserTrackingDataTable() {
  const t = useTranslations("UserTrackingPage.table");

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsIndex.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsIndex.withDefault(10)
  );
  const [date, setDate] = useQueryState("date", parseAsString.withDefault(""));
  const [domain, setDomain] = useQueryState(
    "domain",
    parseAsString.withDefault("apkafe.com")
  );

  // Function to handle page changes with minimum value check
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, page));
  };

  // Convert string date to CalendarDate and back
  const calendarDate = date ? parseDate(date) : undefined;
  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDate(newDate.toString());
    } else {
      setDate("");
    }
  };

  // Handler for refresh button click
  const handleRefresh = () => {
    // In a real app, this would trigger a data refetch
    console.log("Refreshing data...");
  };

  // Check if data is empty
  const isDataEmpty = !userTrackingData || userTrackingData.length === 0;

  return (
    <div>
      {/* Filters Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-700"
              htmlFor="domain"
            >
              {t("filters.selectDomain")}
            </label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("placeholders.selectDomain")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apkafe.com">apkafe.com</SelectItem>
                <SelectItem value="vnitourist.com">vnitourist.com</SelectItem>
                <SelectItem value="vnifood.com">vnifood.com</SelectItem>
                <SelectItem value="betonamuryori.com">
                  betonamuryori.com
                </SelectItem>
                <SelectItem value="lifecompass365.com">
                  lifecompass365.com
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <DatePicker
              className="*:not-first:mt-2"
              value={calendarDate}
              onChange={handleDateChange}
            >
              <Label className="text-foreground text-sm font-medium">
                {t("filters.datePicker")}
              </Label>
              <div className="flex">
                <Group className="w-full">
                  <DateInput className="pe-9" />
                </Group>
                <ButtonAria className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
                  <CalendarIcon size={16} />
                </ButtonAria>
              </div>
              <Popover
                className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
                offset={4}
              >
                <Dialog className="max-h-[inherit] overflow-auto p-2">
                  <Calendar />
                </Dialog>
              </Popover>
            </DatePicker>
          </div>

          <div className="flex items-end">
            <Button>
              <Search className="mr-2 h-4 w-4" /> {t("filters.search")}
            </Button>

            <Button
              variant="default"
              className="ml-4 bg-emerald-600 hover:bg-emerald-700"
            >
              <Map className="mr-2 h-4 w-4" /> {t("filters.viewHeatmap")}
            </Button>
          </div>
        </div>

        {/* Results Table or Empty State */}
        <div className="mt-4">
          {!isDataEmpty ? (
            <EmptyTable onRefresh={handleRefresh} />
          ) : (
            <>
              <div className="mb-4 overflow-hidden [&>div]:max-h-[800px]">
                <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                  <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>{t("columns.id")}</TableHead>
                      <TableHead>{t("columns.timestamp")}</TableHead>
                      <TableHead>{t("columns.ip")}</TableHead>
                      <TableHead>{t("columns.device")}</TableHead>
                      <TableHead className="text-right">
                        <span className="sr-only">{t("columns.actions")}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTrackingData.map(
                      (record: UserRecord, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {record.id}
                          </TableCell>
                          <TableCell>{record.timestamp}</TableCell>
                          <TableCell>{record.ip}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getBadgeColor(record.device)}
                            >
                              {getLocalizedDeviceType(t, record.device)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {t("actions.details")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between gap-8">
                {/* Results per page */}
                <div className="flex items-center gap-3">
                  <Label>{t("pagination.rowsPerPage")}</Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-fit whitespace-nowrap">
                      <SelectValue
                        placeholder={t("placeholders.selectResults")}
                      />
                    </SelectTrigger>
                    <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page number information */}
                <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
                  <p
                    className="text-muted-foreground text-sm whitespace-nowrap"
                    aria-live="polite"
                  >
                    <span className="text-foreground">
                      {Math.min(
                        1 + (currentPage - 1) * pageSize,
                        userTrackingData.length
                      )}
                      -
                      {Math.min(
                        currentPage * pageSize,
                        userTrackingData.length
                      )}
                    </span>{" "}
                    {t("pagination.of")}{" "}
                    <span className="text-foreground">
                      {userTrackingData.length}
                    </span>
                  </p>
                </div>

                {/* Pagination */}
                <div>
                  <Pagination>
                    <PaginationContent>
                      {/* First page button */}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">
                            {t("pagination.firstPage")}
                          </span>
                          <ChevronFirstIcon size={16} aria-hidden="true" />
                        </Button>
                      </PaginationItem>

                      {/* Previous page button */}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">
                            {t("pagination.previousPage")}
                          </span>
                          <ChevronLeftIcon size={16} aria-hidden="true" />
                        </Button>
                      </PaginationItem>

                      {/* Next page button */}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={
                            currentPage ===
                            Math.ceil(userTrackingData.length / pageSize)
                          }
                        >
                          <span className="sr-only">
                            {t("pagination.nextPage")}
                          </span>
                          <ChevronRightIcon size={16} aria-hidden="true" />
                        </Button>
                      </PaginationItem>

                      {/* Last page button */}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                          onClick={() =>
                            handlePageChange(
                              Math.ceil(userTrackingData.length / pageSize)
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(userTrackingData.length / pageSize)
                          }
                        >
                          <span className="sr-only">
                            {t("pagination.lastPage")}
                          </span>
                          <ChevronLastIcon size={16} aria-hidden="true" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const getBadgeColor = (device: string) => {
  switch (device) {
    case "Mobile":
      return "bg-purple-100 text-purple-800";
    case "Tablet":
      return "bg-blue-100 text-blue-800";
    case "Desktop":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get localized device type
const getLocalizedDeviceType = (
  t: (key: string) => string,
  device: string
): string => {
  switch (device) {
    case "Mobile":
      return t("deviceTypes.mobile");
    case "Tablet":
      return t("deviceTypes.tablet");
    case "Desktop":
      return t("deviceTypes.desktop");
    default:
      return device;
  }
};
