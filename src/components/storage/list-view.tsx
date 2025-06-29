"use client";

import React, { useState } from "react";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  ArrowUpDown,
  CheckSquare,
  Download,
  Edit2,
  Folder,
  MoreHorizontal,
  Share2,
  Square,
  Trash2,
} from "lucide-react";

import { IFileItem, IFolderItem } from "@/types/storage.type";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatFileSize, getFileTypeIcon, isImageFile } from "./utils";

interface ListViewProps {
  files: IFileItem[];
  folders: IFolderItem[];
  onFolderClick?: (folderId: string, folderName: string) => void;
  onFileClick?: (file: IFileItem) => void;
  onRename?: (itemId: string, newName: string) => void;
  onDownload?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
  onSort?: (column: string) => void;
}

export function ListView({
  files,
  folders,
  onFolderClick,
  onFileClick,
  onRename,
  onDownload,
  onDelete,
  onShare,
  onSort,
}: ListViewProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const { selectedItems, toggleSelection, sortBy, sortOrder } =
    useStorageStore();

  const handleItemClick = (
    item: IFileItem | IFolderItem,
    e: React.MouseEvent
  ) => {
    const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;

    if (isMultiSelect) {
      toggleSelection(item.id, true);
    } else {
      if (item.type === "folder") {
        onFolderClick?.(item.id, item.name);
      } else {
        onFileClick?.(item);
      }
    }
  };

  const handleCheckboxClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelection(itemId, true);
  };

  const handleRenameClick = (
    item: IFileItem | IFolderItem,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingItem(item.id);
    setEditingName(item.name);
  };

  const handleRenameSubmit = (itemId: string) => {
    if (editingName.trim() && editingName !== "") {
      onRename?.(itemId, editingName.trim());
    }
    setEditingItem(null);
    setEditingName("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter") {
      handleRenameSubmit(itemId);
    } else if (e.key === "Escape") {
      setEditingItem(null);
      setEditingName("");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return (
        <ArrowUpDown
          className={cn(
            "ml-1 h-4 w-4 transition-transform",
            sortOrder === "asc" ? "rotate-0" : "rotate-180"
          )}
        />
      );
    }
    return (
      <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50" />
    );
  };

  const allItems = [...folders, ...files];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted/30 dark:bg-muted/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Folder className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          This folder is empty
        </h3>
        <p className="text-muted-foreground text-sm">
          Drag and drop files here to upload them
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background overflow-hidden rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-border border-b hover:bg-transparent">
            {/* Checkbox Column */}
            <TableHead className="w-[40px] pl-4">
              <div className="flex items-center justify-center">
                <div className="h-4 w-4" />
              </div>
            </TableHead>

            {/* Name Column */}
            <TableHead className="w-[300px]">
              <Button
                variant="ghost"
                className="group text-foreground hover:text-foreground/80 h-auto p-0 font-medium transition-colors"
                onClick={() => onSort?.("name")}
              >
                Name
                {getSortIcon("name")}
              </Button>
            </TableHead>

            {/* Modified Column */}
            <TableHead className="w-[140px]">
              <Button
                variant="ghost"
                className="group text-foreground hover:text-foreground/80 h-auto p-0 font-medium transition-colors"
                onClick={() => onSort?.("modified")}
              >
                Modified
                {getSortIcon("modified")}
              </Button>
            </TableHead>

            {/* File Size Column */}
            <TableHead className="w-[100px]">
              <Button
                variant="ghost"
                className="group text-foreground hover:text-foreground/80 h-auto p-0 font-medium transition-colors"
                onClick={() => onSort?.("size")}
              >
                File size
                {getSortIcon("size")}
              </Button>
            </TableHead>

            {/* Sharing Column */}
            <TableHead className="w-[80px]">Sharing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            const isHovered = hoveredRow === item.id;

            return (
              <TableRow
                key={item.id}
                className={cn(
                  "border-border/50 cursor-pointer border-b transition-all duration-200",
                  "hover:bg-accent/30 dark:hover:bg-accent/20",
                  isSelected &&
                    "bg-primary/5 dark:bg-primary/10 border-primary/20"
                )}
                onClick={(e) => handleItemClick(item, e)}
                onMouseEnter={() => setHoveredRow(item.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Checkbox Column */}
                <TableCell className="pl-4">
                  <div
                    className="flex items-center justify-center"
                    onClick={(e) => handleCheckboxClick(item.id, e)}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/50",
                        isHovered || isSelected ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3 w-3" />
                      ) : (
                        <Square className="text-muted-foreground h-3 w-3" />
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Name Column */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center">
                      {getFileTypeIcon(item.mimeType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingItem === item.id ? (
                        <Input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleRenameSubmit(item.id)}
                          onKeyDown={(e) => handleRenameKeyDown(e, item.id)}
                          className="border-primary bg-background h-7 px-2 py-1 text-sm font-medium"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex min-h-[20px] items-center gap-2">
                            <p className="text-foreground truncate text-sm font-medium">
                              {item.name}
                            </p>
                            {/* Quick Action Buttons - Always reserve space */}
                            <div className="ml-auto flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "hover:bg-accent/50 h-6 w-6 p-0 transition-opacity duration-200",
                                  isHovered || isSelected
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShare?.(item.id);
                                }}
                                title="Share"
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "hover:bg-accent/50 h-6 w-6 p-0 transition-opacity duration-200",
                                  isHovered || isSelected
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                                onClick={(e) => handleRenameClick(item, e)}
                                title="Rename"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              {/* More Actions Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "hover:bg-accent/50 h-6 w-6 p-0 transition-opacity duration-200",
                                      isHovered || isSelected
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                    title="More actions"
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="border-border bg-background w-48 p-1"
                                >
                                  {/* Rename (duplicate but accessible) */}
                                  <DropdownMenuItem
                                    onClick={(e) => handleRenameClick(item, e)}
                                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
                                  >
                                    <Edit2 className="mr-3 h-4 w-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  {item.type === "file" && (
                                    <DropdownMenuItem
                                      onClick={() => onDownload?.(item.id)}
                                      className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
                                    >
                                      <Download className="mr-3 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => onShare?.(item.id)}
                                    className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
                                  >
                                    <Share2 className="mr-3 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border my-1" />
                                  <DropdownMenuItem
                                    onClick={() => onDelete?.(item.id)}
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive dark:hover:bg-destructive/20 dark:focus:bg-destructive/20 cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
                                  >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="min-h-[16px]">
                            <p className="text-muted-foreground truncate text-xs">
                              {item.owner}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Modified Column */}
                <TableCell className="text-muted-foreground text-sm">
                  {item.modifiedDate}
                </TableCell>

                {/* File Size Column */}
                <TableCell className="text-muted-foreground text-sm">
                  {item.type === "folder"
                    ? `${(item as IFolderItem).itemCount} items`
                    : formatFileSize(item.size)}
                </TableCell>

                {/* Sharing Column */}
                <TableCell>
                  {item.shared ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "flex h-6 w-6 items-center justify-center p-0 transition-all duration-200",
                        "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                      )}
                    >
                      <Share2 className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Private
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

