"use client";

import { CSSProperties, useState } from "react";

import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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

import { SearchBar } from "./search-bar";

type LogBehaviorItem = {
  uid: string;
  app: string;
  country: string;
  platform: string;
  network: string;
  timeutc: string;
  date: string;
  behavior: {
    INSTALL?: string;
    PERMISSION_SMS?: string;
    MyNotification?: string;
    MyNotification_Digi?: string;
    GET_MIN_DIGI?: string;
    LOAD_URL_WAP_1?: string;
    CHECK_3G?: string;
    POST_URL_SUCCESS?: string;
    Click_requestTac?: string;
    CLICK_OK_DIALOG?: string;
    OnSmsReceived?: string;
    CONTENT_OTP_Digi_1?: string;
    CONTENT_OTP_Digi_2?: string;
    SMS_RETRIEVED_ACTION?: string;
    fillNameOtp?: string;
    SUB_OK_Confirm_GA?: string;
    CLICK_CONFIRM?: string;
    [key: string]: string | undefined; // Allow for dynamic behavior keys
  };
};

// Add Badge component definition
const Badge = ({
  variant,
  children,
}: {
  variant: "success" | "error" | "warning" | "default";
  children: React.ReactNode;
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        variant === "success" && "bg-green-50 text-green-700 ring-green-600/20",
        variant === "error" && "bg-red-50 text-red-700 ring-red-600/20",
        variant === "warning" &&
          "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
        variant === "default" && "bg-gray-50 text-gray-700 ring-gray-600/20"
      )}
    >
      {children}
    </span>
  );
};

// Helper function to compute pinning styles for columns
const getPinningStyles = (column: Column<LogBehaviorItem>): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    backgroundColor: isPinned ? "#fff" : "transparent",
  };
};

const columns: ColumnDef<LogBehaviorItem>[] = [
  {
    header: "ID",
    accessorKey: "uid",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("uid")}</div>
    ),
  },
  {
    header: "Application",
    accessorKey: "app",
    cell: ({ row }) => (
      <div className="font-mono text-sm text-gray-900">
        {row.getValue("app") || "N/A"}
      </div>
    ),
  },
  {
    header: "Nation",
    accessorKey: "country",
    cell: ({ row }) => (
      <div className="font-mono text-sm text-gray-900">
        {row.getValue("country") || "N/A"}
      </div>
    ),
  },
  {
    header: "Foundation",
    accessorKey: "platform",
    cell: ({ row }) => (
      <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-xs text-gray-800">
        {row.getValue("platform") || "N/A"}
      </div>
    ),
  },
  {
    header: "Operator",
    accessorKey: "network",
    cell: ({ row }) => (
      <div className="font-mono text-sm text-gray-900">
        {row.getValue("network") || "KHONG_CO_SIM"}
      </div>
    ),
  },
  {
    header: "Time utc",
    accessorKey: "timeutc",
    cell: ({ row }) => (
      <div className="font-mono text-xs">
        {row.getValue("timeutc") || "N/A"}
      </div>
    ),
  },
  {
    header: "Day creation",
    accessorKey: "date",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("date") || "N/A"}</div>
    ),
  },
  {
    header: "Behavior",
    accessorKey: "behavior",
    cell: ({ row }) => {
      const behavior = row.getValue("behavior") as LogBehaviorItem["behavior"];
      if (!behavior) return <span className="text-gray-400">N/A</span>;

      return (
        <div className="max-w-md space-y-1.5 whitespace-normal">
          {Object.entries(behavior).map(([key, value]) => {
            let bgColor = "bg-gray-50";
            let textColor = "text-gray-600";

            if (key.includes("INSTALL")) {
              bgColor = "bg-emerald-50";
              textColor = "text-emerald-700";
            } else if (value?.includes("SUCCESS") || key.includes("SUB_OK")) {
              bgColor = "bg-blue-50";
              textColor = "text-blue-700";
            } else if (
              key.includes("ERRO") ||
              value?.includes("ERRO") ||
              key.includes("SAI_")
            ) {
              bgColor = "bg-red-50";
              textColor = "text-red-700";
            } else if (key.includes("PERMISSION")) {
              bgColor = "bg-amber-50";
              textColor = "text-amber-700";
            }

            if (!value) return null;

            return (
              <div
                key={key}
                className={`rounded p-1.5 text-xs ${bgColor} break-words`}
              >
                <span className={`font-medium ${textColor}`}>{key}:</span>{" "}
                {value.includes("DEVICE:") ? (
                  <>
                    <span className="break-all">
                      {value.split("DEVICE:")[0].trim()}
                    </span>
                    <div className="mt-1 font-mono text-xs break-all text-gray-500">
                      DEVICE: {value.split("DEVICE:")[1].trim()}
                    </div>
                  </>
                ) : value.match(/^https?:\/\//) ? (
                  <span className="break-all text-blue-600 hover:text-blue-800">
                    {value}
                  </span>
                ) : (
                  <span className="break-all">{value}</span>
                )}
              </div>
            );
          })}
        </div>
      );
    },
    size: 300,
  },
];

export default function LogBehaviorDataTable() {
  const [data, setData] = useState<LogBehaviorItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "uid",
      desc: true,
    },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Data for select filters
  const [applications, setApplications] = useState([
    { value: "com.modobom.app1", label: "Modobom App 1" },
    { value: "com.modobom.app2", label: "Modobom App 2" },
    { value: "com.modobom.app3", label: "Modobom App 3" },
  ]);

  const [nations, setNations] = useState([
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "jp", label: "Japan" },
    { value: "vn", label: "Vietnam" },
  ]);

  const [platforms, setPlatforms] = useState([
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "tiktok", label: "TikTok" },
    { value: "google", label: "Google" },
    { value: "youtube", label: "YouTube" },
  ]);

  const [networks, setNetworks] = useState([
    { value: "wifi", label: "WiFi" },
    { value: "4g", label: "4G" },
    { value: "5g", label: "5G" },
    { value: "3g", label: "3G" },
  ]);

  const handleSearch = (values: any) => {
    console.log("Search values:", values);
    // Here you would normally make an API call with these filters
    // For now, we're just setting the global filter to simulate search
    if (values.total) {
      setGlobalFilter(values.total);
    }
  };

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableSortingRemoval: false,
    manualPagination: false,
    pageCount: Math.ceil(data.length / pagination.pageSize),
  });

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          applications={applications}
          nations={nations}
          platforms={platforms}
          networks={networks}
        />
      </div>

      <div className="w-full">
        <Table
          className="[&_td]:border-border [&_th]:border-border w-full table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
          style={{
            minWidth: "100%",
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => {
                  const { column } = header;
                  const isPinned = column.getIsPinned();
                  const isLastLeftPinned =
                    isPinned === "left" && column.getIsLastColumn("left");
                  const isFirstRightPinned =
                    isPinned === "right" && column.getIsFirstColumn("right");

                  return (
                    <TableHead
                      key={header.id}
                      className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-muted/90 relative h-10 truncate border-t data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l"
                      colSpan={header.colSpan}
                      style={{
                        ...getPinningStyles(column),
                      }}
                      data-pinned={isPinned || undefined}
                      data-last-col={
                        isLastLeftPinned
                          ? "left"
                          : isFirstRightPinned
                            ? "right"
                            : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { column } = cell;
                    const isPinned = column.getIsPinned();
                    const isLastLeftPinned =
                      isPinned === "left" && column.getIsLastColumn("left");
                    const isFirstRightPinned =
                      isPinned === "right" && column.getIsFirstColumn("right");

                    return (
                      <TableCell
                        key={cell.id}
                        className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l"
                        style={{
                          ...getPinningStyles(column),
                        }}
                        data-pinned={isPinned || undefined}
                        data-last-col={
                          isLastLeftPinned
                            ? "left"
                            : isFirstRightPinned
                              ? "right"
                              : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8 pt-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="rows-per-page" className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              id="rows-per-page"
              className="w-fit whitespace-nowrap"
            >
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground flex grow justify-end text-sm">
          <p className="text-muted-foreground text-sm">
            Page{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of <span className="font-medium">{table.getPageCount()}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
