"use client";

import React, { useState } from "react";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  Archive,
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

interface GridViewProps {
  files: IFileItem[];
  folders: IFolderItem[];
  onFolderClick?: (folderId: string, folderName: string) => void;
  onFileClick?: (file: IFileItem) => void;
  onRename?: (itemId: string, newName: string) => void;
  onDownload?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
}

export function GridView({
  files,
  folders,
  onFolderClick,
  onFileClick,
  onRename,
  onDownload,
  onDelete,
  onShare,
}: GridViewProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { selectedItems, toggleSelection } = useStorageStore();

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

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "folder")
      return <Folder className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("image/"))
      return <Image className="h-8 w-8 text-green-500" />;
    if (mimeType.startsWith("video/"))
      return <Video className="h-8 w-8 text-red-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-8 w-8 text-purple-500" />;
    if (mimeType.includes("pdf"))
      return <FileText className="h-8 w-8 text-red-600" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive className="h-8 w-8 text-orange-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {allItems.map((item) => (
        <div
          key={item.id}
          className={cn(
            "group relative cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm",
            selectedItems.includes(item.id) && "bg-blue-50 ring-2 ring-blue-500"
          )}
          onClick={(e) => handleItemClick(item, e)}
        >
          {/* Thumbnail/Icon */}
          <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {item.type === "file" && item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {getFileIcon(item.mimeType)}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            {editingItem === item.id ? (
              <Input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameSubmit(item.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, item.id)}
                className="h-6 border-blue-500 px-1 py-0 text-xs"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p
                className="truncate text-xs leading-tight font-medium text-gray-900"
                title={item.name}
              >
                {item.name}
              </p>
            )}

            {/* Metadata */}
            <div className="space-y-0.5 text-xs text-gray-500">
              <p>{item.modifiedDate}</p>
              {item.type === "file" && <p>{formatFileSize(item.size)}</p>}
              {item.type === "folder" && <p>{item.itemCount} items</p>}
            </div>
          </div>

          {/* Shared indicator */}
          {item.shared && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="flex h-5 w-5 items-center justify-center p-0"
              >
                <Share2 className="h-3 w-3" />
              </Badge>
            </div>
          )}

          {/* Actions menu */}
          <div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 bg-white p-0 shadow-sm hover:bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={(e) => handleRenameClick(item, e)}>
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
          </div>
        </div>
      ))}
    </div>
  );
}
