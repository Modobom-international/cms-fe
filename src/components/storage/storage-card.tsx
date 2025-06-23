"use client";

import React, { useState } from "react";

import {
  Archive,
  CheckSquare,
  Download,
  Edit2,
  File,
  FileText,
  Folder,
  Image,
  Music,
  Share2,
  Square,
  Trash2,
  Video,
} from "lucide-react";

import { IFileItem, IFolderItem } from "@/types/storage.type";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";

interface StorageCardProps {
  item: IFileItem | IFolderItem;
  isSelected: boolean;
  isEditing: boolean;
  editingName: string;
  onItemClick?: (item: IFileItem | IFolderItem, e: React.MouseEvent) => void;
  onSelectionToggle?: (itemId: string, e: React.MouseEvent) => void;
  onEditStart?: (item: IFileItem | IFolderItem) => void;
  onEditSubmit?: (itemId: string, newName: string) => void;
  onEditCancel?: () => void;
  onEditNameChange?: (name: string) => void;
  onRename?: (itemId: string, newName: string) => void;
  onDownload?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
}

export function StorageCard({
  item,
  isSelected,
  isEditing,
  editingName,
  onItemClick,
  onSelectionToggle,
  onEditStart,
  onEditSubmit,
  onEditCancel,
  onEditNameChange,
  onRename,
  onDownload,
  onDelete,
  onShare,
}: StorageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking on checkbox area, handle selection
    const target = e.target as HTMLElement;
    if (target.closest("[data-checkbox]")) {
      e.stopPropagation();
      onSelectionToggle?.(item.id, e);
      return;
    }

    // Handle multi-select with Ctrl/Cmd
    const isMultiSelect = e.ctrlKey || e.metaKey;
    if (isMultiSelect) {
      onSelectionToggle?.(item.id, e);
    } else {
      onItemClick?.(item, e);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onEditSubmit?.(item.id, editingName);
    } else if (e.key === "Escape") {
      onEditCancel?.();
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
      return <Folder className="text-primary h-8 w-8" />;
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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group relative cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm",
            isSelected && "ring-primary ring-2"
          )}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Selection Checkbox */}
          <div
            className={cn(
              "absolute top-2 left-2 z-10 transition-opacity",
              isSelected || isHovered ? "opacity-100" : "opacity-0"
            )}
            data-checkbox
            onClick={(e) => {
              e.stopPropagation();
              onSelectionToggle?.(item.id, e);
            }}
          >
            <div className="hover:border-primary flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300 bg-white shadow-sm">
              {isSelected ? (
                <CheckSquare className="text-primary h-4 w-4" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

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
            {isEditing ? (
              <Input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange?.(e.target.value)}
                onBlur={() => onEditSubmit?.(item.id, editingName)}
                onKeyDown={handleEditKeyDown}
                className="border-primary h-6 px-1 py-0 text-xs"
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
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={() => onEditStart?.(item)}>
          <Edit2 className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>

        {item.type === "file" && (
          <ContextMenuItem onClick={() => onDownload?.(item.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={() => onShare?.(item.id)}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => onDelete?.(item.id)}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
