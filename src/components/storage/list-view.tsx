"use client";

import React, { useState } from "react";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  Archive,
  ArrowUpDown,
  Download,
  Edit2,
  File,
  FileText,
  Folder,
  Image,
  MoreHorizontal,
  Music,
  Share2,
  Trash2,
  Video,
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string, size: "sm" | "md" = "sm") => {
    const iconSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

    if (mimeType === "folder")
      return <Folder className={cn(iconSize, "text-blue-500")} />;
    if (mimeType.startsWith("image/"))
      return <Image className={cn(iconSize, "text-green-500")} />;
    if (mimeType.startsWith("video/"))
      return <Video className={cn(iconSize, "text-red-500")} />;
    if (mimeType.startsWith("audio/"))
      return <Music className={cn(iconSize, "text-purple-500")} />;
    if (mimeType.includes("pdf"))
      return <FileText className={cn(iconSize, "text-red-600")} />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive className={cn(iconSize, "text-orange-500")} />;
    return <File className={cn(iconSize, "text-gray-500")} />;
  };

  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return (
        <ArrowUpDown
          className={cn(
            "ml-1 h-4 w-4",
            sortOrder === "asc" ? "rotate-0" : "rotate-180"
          )}
        />
      );
    }
    return (
      <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-50" />
    );
  };

  const allItems = [...folders, ...files];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Folder className="mb-4 h-20 w-20 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          This folder is empty
        </h3>
        <p className="text-sm text-gray-500">
          Drag and drop files here to upload them
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">
              <Button
                variant="ghost"
                className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                onClick={() => onSort?.("name")}
              >
                Name
                {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">
              <Button
                variant="ghost"
                className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                onClick={() => onSort?.("modified")}
              >
                Modified
                {getSortIcon("modified")}
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">
              <Button
                variant="ghost"
                className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                onClick={() => onSort?.("size")}
              >
                Size
                {getSortIcon("size")}
              </Button>
            </TableHead>
            <TableHead className="w-[80px]">Sharing</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-gray-50",
                selectedItems.includes(item.id) && "bg-blue-50"
              )}
              onClick={(e) => handleItemClick(item, e)}
            >
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center">
                    {item.type === "file" && item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      getFileIcon(item.mimeType, "md")
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {editingItem === item.id ? (
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(item.id)}
                        onKeyDown={(e) => handleRenameKeyDown(e, item.id)}
                        className="h-8 border-blue-500 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {item.owner}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm text-gray-600">
                {item.modifiedDate}
              </TableCell>

              <TableCell className="text-sm text-gray-600">
                {item.type === "folder"
                  ? `${(item as IFolderItem).itemCount} items`
                  : formatFileSize(item.size)}
              </TableCell>

              <TableCell>
                {item.shared && (
                  <Badge
                    variant="secondary"
                    className="flex h-6 w-6 items-center justify-center p-0"
                  >
                    <Share2 className="h-3 w-3" />
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => handleRenameClick(item, e)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    {item.type === "file" && (
                      <DropdownMenuItem onClick={() => onDownload?.(item.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onShare?.(item.id)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(item.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
