"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontalIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
} from "lucide-react";

export type UserColumn = {
    id: string;
    name: string;
    email: string;
    team: string;
};

export const userColumns: ColumnDef<UserColumn>[] = [
    {
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => (
            <div className="truncate font-medium text-muted-foreground">
                {row.getValue("id")}
            </div>
        ),
    },
    {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
            <div className="truncate font-medium">{row.getValue("name")}</div>
        ),
        sortUndefined: "last",
        sortDescFirst: false,
    },
    {
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => (
            <div className="truncate">{row.getValue("email")}</div>
        ),
    },
    {
        header: "Team",
        accessorKey: "team",
        cell: ({ row }) => (
            <div className="truncate">{row.getValue("team")}</div>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <MoreHorizontalIcon className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <UserIcon className="mr-2 h-4 w-4" />
                                View Profile
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
