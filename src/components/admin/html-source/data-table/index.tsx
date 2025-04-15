/* eslint-disable unused-imports/no-unused-vars */
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
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EllipsisIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinOffIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

/* eslint-disable unused-imports/no-unused-vars */

/* eslint-disable unused-imports/no-unused-vars */

type HtmlSourceItem = {
  id: number;
  url: string; // Pathway
  country: string; // Nation
  source: string;
  device_id: string;
  app_id: string;
  version: string;
  created_date: string; // Day creation
  note: string;
  platform: string; // Platform (TikTok, Google, Facebook, etc.)
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
const getPinningStyles = (column: Column<HtmlSourceItem>): CSSProperties => {
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

const columns: ColumnDef<HtmlSourceItem>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("id")}</div>
    ),
  },
  {
    header: "Pathway",
    accessorKey: "url",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <GlobeIcon className="text-muted-foreground h-4 w-4" />
        <span className="truncate font-medium">{row.getValue("url")}</span>
      </div>
    ),
  },
  {
    header: "Nation",
    accessorKey: "country",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="truncate">{row.getValue("country")}</span>
      </div>
    ),
  },
  {
    header: "Platform",
    accessorKey: "platform",
    cell: ({ row }) => {
      const platform = row.getValue("platform") as string;
      let badgeVariant: "success" | "warning" | "error" | "default" = "default";

      // Assign badge colors based on platform
      if (["facebook", "instagram", "meta"].includes(platform.toLowerCase())) {
        badgeVariant = "success";
      } else if (["tiktok", "douyin"].includes(platform.toLowerCase())) {
        badgeVariant = "warning";
      } else if (["google", "youtube"].includes(platform.toLowerCase())) {
        badgeVariant = "error";
      }

      return (
        <div className="flex items-center gap-2">
          <Badge variant={badgeVariant}>{platform}</Badge>
        </div>
      );
    },
  },
  {
    header: "Source",
    accessorKey: "source",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="max-w-[200px] truncate font-mono text-sm">
          {(row.getValue("source") as string).substring(0, 50)}...
        </span>
      </div>
    ),
  },
  {
    header: "Device",
    accessorKey: "device_id",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserIcon className="text-muted-foreground h-4 w-4" />
        <span className="truncate">{row.getValue("device_id")}</span>
      </div>
    ),
  },
  {
    header: "Application ID",
    accessorKey: "app_id",
    cell: ({ row }) => (
      <div className="text-muted-foreground truncate">
        {row.getValue("app_id")}
      </div>
    ),
  },
  {
    header: "Version",
    accessorKey: "version",
    cell: ({ row }) => (
      <div className="text-muted-foreground truncate">
        {row.getValue("version")}
      </div>
    ),
  },
  {
    header: "Day creation",
    accessorKey: "created_date",
    cell: ({ row }) => (
      <div className="text-muted-foreground truncate">
        {row.getValue("created_date")}
      </div>
    ),
  },
  {
    header: "Note",
    accessorKey: "note",
    cell: ({ row }) => (
      <div className="text-muted-foreground max-w-[200px] truncate">
        {row.getValue("note") || "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const htmlSource = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem>
                <PencilIcon className="mr-2 h-4 w-4" />
                View Source
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function HtmlSourceDataTable() {
  const [data, setData] = useState<HtmlSourceItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "id",
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
    { value: "twitter", label: "Twitter" },
    { value: "pinterest", label: "Pinterest" },
    { value: "snapchat", label: "Snapchat" },
    { value: "linkedin", label: "LinkedIn" },
  ]);

  const handleSearch = (values: any) => {
    console.log("Search values:", values);
    // Here you would normally make an API call with these filters
    // For now, we're just setting the global filter to simulate search
    if (values.sourceKeyword) {
      setGlobalFilter(values.sourceKeyword);
    }

    // In a real implementation, you would filter data based on all criteria
    // including platform, application, nation, etc.
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
    // Get filtered rows & total row counts
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
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      <div
                        className={cn(
                          "flex items-center justify-between gap-2",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none"
                        )}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        onKeyDown={(e) => {
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="flex items-center">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUpIcon className="size-4 shrink-0 opacity-60" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDownIcon className="size-4 shrink-0 opacity-60" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {/* Pin/Unpin column controls with enhanced accessibility */}
                        {!header.isPlaceholder &&
                          header.column.getCanPin() &&
                          (header.column.getIsPinned() ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="-mr-1 size-7 shadow-none"
                              onClick={() => header.column.pin(false)}
                              aria-label={`Unpin ${
                                header.column.columnDef.header as string
                              } column`}
                              title={`Unpin ${
                                header.column.columnDef.header as string
                              } column`}
                            >
                              <PinOffIcon
                                className="opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            </Button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="-mr-1 size-7 shadow-none"
                                  aria-label={`Pin options for ${
                                    header.column.columnDef.header as string
                                  } column`}
                                  title={`Pin options for ${
                                    header.column.columnDef.header as string
                                  } column`}
                                >
                                  <EllipsisIcon
                                    className="opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => header.column.pin("left")}
                                >
                                  <ArrowLeftToLineIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                  />
                                  Stick to left
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => header.column.pin("right")}
                                >
                                  <ArrowRightToLineIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                  />
                                  Stick to right
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ))}
                        {header.column.getCanResize() && (
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className:
                                "absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px",
                            }}
                          />
                        )}
                      </div>
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
        {/* Results per page */}
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
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
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
              {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            of{" "}
            <span className="text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
