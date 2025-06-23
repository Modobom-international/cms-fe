"use client";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import { Check, ChevronDown, Filter, Grid3X3, Info, List } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StorageToolbarProps {
  itemCount?: number;
}

export function StorageToolbar({ itemCount = 0 }: StorageToolbarProps) {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showDetailsPanel,
    setShowDetailsPanel,
  } = useStorageStore();

  return (
    <div className="bg-background flex items-center justify-end py-3">
      {/* Right Side - View Controls, Sort, and Stats */}
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-secondary/50 text-secondary-foreground dark:bg-secondary/20 dark:text-secondary-foreground text-xs font-normal"
        >
          {itemCount} items
        </Badge>

        <div className="bg-border dark:bg-border h-6 w-px" />

        {/* View Mode Toggle */}
        <div className="border-border bg-muted/30 dark:bg-muted/20 flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-8 px-3 ${
              viewMode === "list"
                ? "bg-background shadow-sm"
                : "hover:bg-muted/50"
            }`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-8 px-3 ${
              viewMode === "grid"
                ? "bg-background shadow-sm"
                : "hover:bg-muted/50 dark:hover:bg-muted/30"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground gap-1"
            >
              <Filter className="h-4 w-4" />
              Sort
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Sort Criteria */}
            <DropdownMenuItem
              onClick={() => setSortBy("name")}
              className="flex items-center justify-between"
            >
              <span>Name</span>
              {sortBy === "name" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("modified")}
              className="flex items-center justify-between"
            >
              <span>Modified</span>
              {sortBy === "modified" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("size")}
              className="flex items-center justify-between"
            >
              <span>File size</span>
              {sortBy === "size" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("type")}
              className="flex items-center justify-between"
            >
              <span>Type</span>
              {sortBy === "type" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Sort Direction */}
            <DropdownMenuItem
              onClick={() => setSortOrder("asc")}
              className="flex items-center justify-between"
            >
              <span>Ascending</span>
              {sortOrder === "asc" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortOrder("desc")}
              className="flex items-center justify-between"
            >
              <span>Descending</span>
              {sortOrder === "desc" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDetailsPanel(!showDetailsPanel)}
          className="rounded-full"
        >
          <Info className="text-foreground size-4.5" />
        </Button>
      </div>
    </div>
  );
}

