"use client";
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
import { cn } from "@/lib/utils";
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
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react";
import { CSSProperties, useEffect, useState } from "react";
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
                variant === "success" &&
                    "bg-green-50 text-green-700 ring-green-600/20",
                variant === "error" && "bg-red-50 text-red-700 ring-red-600/20",
                variant === "warning" &&
                    "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
                variant === "default" &&
                    "bg-gray-50 text-gray-700 ring-gray-600/20"
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
        right:
            isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
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
            <div className="text-sm font-mono text-gray-900">
                {row.getValue("app") || "N/A"}
            </div>
        ),
    },
    {
        header: "Nation",
        accessorKey: "country",
        cell: ({ row }) => (
            <div className="text-sm font-mono text-gray-900">
                {row.getValue("country") || "N/A"}
            </div>
        ),
    },
    {
        header: "Foundation",
        accessorKey: "platform",
        cell: ({ row }) => (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-gray-100 text-gray-800">
                {row.getValue("platform") || "N/A"}
            </div>
        ),
    },
    {
        header: "Operator",
        accessorKey: "network",
        cell: ({ row }) => (
            <div className="text-sm font-mono text-gray-900">
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
            <div className="font-mono text-xs">
                {row.getValue("date") || "N/A"}
            </div>
        ),
    },
    {
        header: "Behavior",
        accessorKey: "behavior",
        cell: ({ row }) => {
            const behavior = row.getValue(
                "behavior"
            ) as LogBehaviorItem["behavior"];
            if (!behavior) return <span className="text-gray-400">N/A</span>;

            return (
                <div className="space-y-1.5 max-w-md whitespace-normal">
                    {Object.entries(behavior).map(([key, value]) => {
                        let bgColor = "bg-gray-50";
                        let textColor = "text-gray-600";

                        if (key.includes("INSTALL")) {
                            bgColor = "bg-emerald-50";
                            textColor = "text-emerald-700";
                        } else if (
                            value?.includes("SUCCESS") ||
                            key.includes("SUB_OK")
                        ) {
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
                                className={`text-xs p-1.5 rounded ${bgColor} break-words`}
                            >
                                <span className={`font-medium ${textColor}`}>
                                    {key}:
                                </span>{" "}
                                {value.includes("DEVICE:") ? (
                                    <>
                                        <span className="break-all">
                                            {value.split("DEVICE:")[0].trim()}
                                        </span>
                                        <div className="mt-1 font-mono text-xs text-gray-500 break-all">
                                            DEVICE:{" "}
                                            {value.split("DEVICE:")[1].trim()}
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

    useEffect(() => {
        // Example data based on the real output
        setData([
            {
                uid: "18d5a78c-f496-49d6-b96f-9154bf1475b7",
                app: "BlueLockBlazeBattle",
                country: "Malaysia",
                platform: "Tiktok",
                network: "DiGi_50216",
                timeutc: "1742378831021",
                date: "2025-03-19 17:07:11",
                behavior: {
                    INSTALL:
                        "Update_File_V1 21/01/2025 - DEVICE: samsung-SM-A136B-14",
                    PERMISSION_SMS: "SUCCESS",
                    MyNotification: "2025-03-19 : 17:08:17 Start",
                    MyNotification_Digi: "2025-03-19 : 17:08:17 Start_Digi",
                    GET_MIN_DIGI:
                        "https://apizep.modobomz.com/lpdigi/33980/ga _ GA",
                    LOAD_URL_WAP_1:
                        "https://apizep.modobomz.com/lpdigi/33980/ga",
                    CHECK_3G:
                        'ON {"as":"AS4818 DiGi Telecommunications Sdn. Bhd.","city":"Kuala Lumpur","country":"Malaysia","countryCode":"MY","hosting":false,"isp":"DiGi Telecommunications Sdn Bhd., Digi Internet Exchange","lat":3.1203,"lon":101.6898,"mobile":true,"org":"DiGi Telecommunications Sdn Bhd","proxy":false,"region":"14","regionName":"Kuala Lumpur","status":"success","timezone":"Asia/Kuala_Lumpur","zip":"58100"}',
                    POST_URL_SUCCESS:
                        '{"success":true,"message":"Save data success"}',
                    Click_requestTac:
                        "http://wap-cpa.digi.com.my/TransactionConfirm.jsp;jsessionid=2E572A5A64FACEAA76496C3F6EB6DD892",
                    CLICK_OK_DIALOG: "OK",
                    OnSmsReceived: "OK",
                    CONTENT_OTP_Digi_1:
                        "2025-03-19 : 17:07:32 RM0:Your TAC for ga service subscription is 3315(expires in 2mins).Please ignore if you did not request.",
                    SMS_RETRIEVED_ACTION: "FALSE",
                    fillNameOtp: "2025-03-19 : 17:07:35-9532",
                    CONTENT_OTP_Digi_2:
                        "2025-03-19 : 17:07:35 RM0:Your TAC for ga service subscription is 9532(expires in 2mins).Please ignore if you did not request.",
                    SUB_OK_Confirm_GA: "33980_GA",
                    CLICK_CONFIRM: "2025-03-19 : 17:07:48 confirmURL",
                },
            },
            {
                uid: "29f4b67d-e385-58c7-a9d3-8243ce2386a8",
                app: "DragonBallLegends",
                country: "Indonesia",
                platform: "Facebook",
                network: "Telkomsel_51010",
                timeutc: "1742378845632",
                date: "2025-03-19 17:15:23",
                behavior: {
                    INSTALL:
                        "Update_File_V2 22/01/2025 - DEVICE: xiaomi-Redmi-Note-12",
                    PERMISSION_SMS: "SUCCESS",
                    MyNotification: "2025-03-19 : 17:16:05 Start",
                    GET_MIN_TELKOMSEL:
                        "https://apizep.modobomz.com/lptelkomsel/45123/fb",
                    CHECK_3G:
                        'ON {"as":"AS7713 PT Telekomunikasi Indonesia","city":"Jakarta","country":"Indonesia","countryCode":"ID","hosting":false,"mobile":true,"status":"success"}',
                    POST_URL_SUCCESS:
                        '{"success":true,"message":"Data saved successfully"}',
                    CLICK_OK_DIALOG: "OK",
                    SMS_RETRIEVED_ACTION: "TRUE",
                    SUB_OK_Confirm_FB: "45123_FB",
                },
            },
            {
                uid: "3ac5d89e-f274-69d8-b8e2-7132df349c9b",
                app: "NarutoXBoruto",
                country: "Vietnam",
                platform: "Google",
                network: "Viettel_45204",
                timeutc: "1742378892145",
                date: "2025-03-19 17:22:45",
                behavior: {
                    INSTALL:
                        "New_Install_V1 23/01/2025 - DEVICE: oppo-Reno8-5G",
                    PERMISSION_SMS: "SUCCESS",
                    MyNotification: "2025-03-19 : 17:23:12 Start",
                    GET_MIN_VIETTEL:
                        "https://apizep.modobomz.com/lpviettel/56789/gg",
                    CHECK_3G:
                        'ON {"as":"AS45204 Viettel Group","city":"Hanoi","country":"Vietnam","countryCode":"VN","mobile":true,"status":"success"}',
                    CLICK_OK_DIALOG: "OK",
                    SMS_RETRIEVED_ACTION: "TRUE",
                    SUB_OK_Confirm_GG: "56789_GG",
                },
            },
            {
                uid: "4bd6e9af-g385-7ae9-c9f3-6021ef458d0c",
                app: "OnePieceTC",
                country: "Thailand",
                platform: "Tiktok",
                network: "AIS_52001",
                timeutc: "1742378923478",
                date: "2025-03-19 17:30:15",
                behavior: {
                    INSTALL: "Update_File_V3 24/01/2025 - DEVICE: vivo-V25-Pro",
                    PERMISSION_SMS: "ERRO_PERMISSION_DENIED",
                    MyNotification: "2025-03-19 : 17:31:02 Start",
                    GET_MIN_AIS: "https://apizep.modobomz.com/lpais/67890/tt",
                    CHECK_3G:
                        'ON {"as":"AS52001 Advanced Info Service PCL.","city":"Bangkok","country":"Thailand","countryCode":"TH","mobile":true,"status":"success"}',
                    POST_URL_SUCCESS:
                        '{"success":false,"message":"Permission denied"}',
                    CLICK_OK_DIALOG: "CANCEL",
                },
            },
            {
                uid: "5ce7f0bg-h496-8bf0-d0g4-4910fg567e1d",
                app: "BleachBS",
                country: "Philippines",
                platform: "Facebook",
                network: "Globe_51502",
                timeutc: "1742378967890",
                date: "2025-03-19 17:38:45",
                behavior: {
                    INSTALL:
                        "New_Install_V2 25/01/2025 - DEVICE: realme-GT-Neo-3",
                    PERMISSION_SMS: "SUCCESS",
                    MyNotification: "2025-03-19 : 17:39:22 Start",
                    GET_MIN_GLOBE:
                        "https://apizep.modobomz.com/lpglobe/78901/fb",
                    CHECK_3G:
                        'ON {"as":"AS51502 Globe Telecom","city":"Manila","country":"Philippines","countryCode":"PH","mobile":true,"status":"success"}',
                    POST_URL_SUCCESS:
                        '{"success":true,"message":"Save data success"}',
                    CLICK_OK_DIALOG: "OK",
                    SMS_RETRIEVED_ACTION: "TRUE",
                    SUB_OK_Confirm_FB: "78901_FB",
                },
            },
            {
                uid: "6df8g1ch-i507-9cg1-e1h5-5821gh678f2e",
                app: "DragonQuestTact",
                country: "Malaysia",
                platform: "Google",
                network: "Maxis_50212",
                timeutc: "1742379012345",
                date: "2025-03-19 17:45:12",
                behavior: {
                    INSTALL:
                        "Update_File_V2 26/01/2025 - DEVICE: samsung-S23-Ultra",
                    PERMISSION_SMS: "SUCCESS",
                    MyNotification: "2025-03-19 : 17:46:03 Start",
                    GET_MIN_MAXIS:
                        "https://apizep.modobomz.com/lpmaxis/89012/gg",
                    CHECK_3G:
                        'ON {"as":"AS50212 Maxis Broadband","city":"Kuala Lumpur","country":"Malaysia","countryCode":"MY","mobile":true,"status":"success"}',
                    POST_URL_SUCCESS:
                        '{"success":true,"message":"Save data success"}',
                    CLICK_OK_DIALOG: "OK",
                    SMS_RETRIEVED_ACTION: "TRUE",
                    SUB_OK_Confirm_GG: "89012_GG",
                },
            },
            {
                uid: "7eg9h2di-j618-0dh2-f2i6-6932hi789g3f",
                app: "FateGrandOrder",
                country: "Indonesia",
                platform: "Tiktok",
                network: "Indosat_51021",
                timeutc: "1742379056789",
                date: "2025-03-19 17:52:33",
                behavior: {
                    INSTALL: "New_Install_V3 27/01/2025 - DEVICE: poco-F5-Pro",
                    PERMISSION_SMS: "SUCCESS",
                    MyNotification: "2025-03-19 : 17:53:15 Start",
                    GET_MIN_INDOSAT:
                        "https://apizep.modobomz.com/lpindosat/90123/tt",
                    CHECK_3G:
                        'ON {"as":"AS51021 PT Indosat","city":"Jakarta","country":"Indonesia","countryCode":"ID","mobile":true,"status":"success"}',
                    POST_URL_SUCCESS:
                        '{"success":true,"message":"Save data success"}',
                    CLICK_OK_DIALOG: "OK",
                    SMS_RETRIEVED_ACTION: "TRUE",
                    SUB_OK_Confirm_TT: "90123_TT",
                },
            },
            {
                uid: "8fh0i3ej-k729-1ei3-g3j7-7043ij890h4g",
                app: "GenshinImpact",
                country: "Vietnam",
                platform: "Facebook",
                network: "Mobifone_45201",
                timeutc: "1742379098765",
                date: "2025-03-19 17:59:58",
                behavior: {
                    INSTALL: "Update_File_V1 28/01/2025 - DEVICE: oneplus-11R",
                    PERMISSION_SMS: "SAI_PERMISSION",
                    MyNotification: "2025-03-19 : 18:00:45 Start",
                    GET_MIN_MOBIFONE:
                        "https://apizep.modobomz.com/lpmobifone/01234/fb",
                    CHECK_3G:
                        'ON {"as":"AS45201 Mobifone Corporation","city":"Ho Chi Minh","country":"Vietnam","countryCode":"VN","mobile":true,"status":"success"}',
                    POST_URL_SUCCESS:
                        '{"success":false,"message":"Invalid permission"}',
                    CLICK_OK_DIALOG: "CANCEL",
                },
            },
        ]);
    }, []);

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
                    className="w-full [&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
                    style={{
                        minWidth: "100%",
                    }}
                >
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-muted/50"
                            >
                                {headerGroup.headers.map((header) => {
                                    const { column } = header;
                                    const isPinned = column.getIsPinned();
                                    const isLastLeftPinned =
                                        isPinned === "left" &&
                                        column.getIsLastColumn("left");
                                    const isFirstRightPinned =
                                        isPinned === "right" &&
                                        column.getIsFirstColumn("right");

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
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const { column } = cell;
                                        const isPinned = column.getIsPinned();
                                        const isLastLeftPinned =
                                            isPinned === "left" &&
                                            column.getIsLastColumn("left");
                                        const isFirstRightPinned =
                                            isPinned === "right" &&
                                            column.getIsFirstColumn("right");

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l"
                                                style={{
                                                    ...getPinningStyles(column),
                                                }}
                                                data-pinned={
                                                    isPinned || undefined
                                                }
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
                                <SelectItem
                                    key={pageSize}
                                    value={pageSize.toString()}
                                >
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-muted-foreground flex grow justify-end text-sm">
                    <p className="text-sm text-muted-foreground">
                        Page{" "}
                        <span className="font-medium">
                            {table.getState().pagination.pageIndex + 1}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                            {table.getPageCount()}
                        </span>
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
