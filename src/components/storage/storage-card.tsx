"use client";

import React, { useState } from "react";

import Image from "next/image";

import {
  CheckSquare,
  Download,
  Edit2,
  Share2,
  Square,
  Trash2,
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

import { formatFileSize, getFileTypeIcon, isImageFile } from "./utils";

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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "group relative cursor-pointer rounded-xl border border-transparent p-4 transition-all duration-200",
            "hover:border-border/50 hover:bg-accent/30 dark:hover:bg-accent/20 hover:shadow-sm",
            isSelected &&
              "border-primary/50 bg-primary/5 dark:bg-primary/10 ring-primary/20 shadow-sm ring-1"
          )}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Selection Checkbox */}
          <div
            className={cn(
              "absolute top-3 left-3 z-10 transition-all duration-200",
              isSelected || isHovered
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0"
            )}
            data-checkbox
            onClick={(e) => {
              e.stopPropagation();
              onSelectionToggle?.(item.id, e);
            }}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded border-2 shadow-sm transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              {isSelected ? (
                <CheckSquare className="h-3 w-3" />
              ) : (
                <Square className="text-muted-foreground h-3 w-3" />
              )}
            </div>
          </div>

          {/* Thumbnail/Icon Container */}
          <div className="bg-muted/40 dark:bg-muted/30 group-hover:bg-muted/40 dark:group-hover:bg-muted/30 relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg transition-colors duration-200">
            {item.type === "file" &&
            isImageFile(item.mimeType) &&
            "downloadUrl" in item ? (
              <>
                <Image
                  src={item.downloadUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to file type icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const iconContainer =
                      target.parentElement?.querySelector(".fallback-icon");
                    if (iconContainer) {
                      (iconContainer as HTMLElement).style.display = "flex";
                    }
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="fallback-icon hidden h-full w-full items-center justify-center">
                  {getFileTypeIcon(item.mimeType, "lg")}
                </div>
                {/* Image preview overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                  <div className="rounded bg-black/50 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Click to preview
                  </div>
                </div>
              </>
            ) : item.type === "file" && item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {getFileTypeIcon(item.mimeType, "lg")}
              </div>
            )}
          </div>

          {/* File Name */}
          <div className="space-y-2">
            {isEditing ? (
              <Input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange?.(e.target.value)}
                onBlur={() => onEditSubmit?.(item.id, editingName)}
                onKeyDown={handleEditKeyDown}
                className="border-primary bg-background h-7 px-2 py-1 text-sm font-medium"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p
                className="text-foreground truncate text-sm leading-tight font-medium"
                title={item.name}
              >
                {item.name}
              </p>
            )}

            {/* File Metadata */}
            <div className="text-muted-foreground space-y-1 text-xs">
              <p className="truncate">{item.modifiedDate}</p>
              <div className="flex items-center justify-between">
                {item.type === "file" && (
                  <span className="font-medium">
                    {formatFileSize(item.size)}
                  </span>
                )}
                {item.type === "folder" && (
                  <span className="font-medium">{item.itemCount} items</span>
                )}
              </div>
            </div>
          </div>

          {/* Shared Indicator */}
          {item.shared && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="secondary"
                className={cn(
                  "flex h-6 w-6 items-center justify-center p-0 transition-all duration-200",
                  "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
                  "hover:bg-violet-200 dark:hover:bg-violet-900/50"
                )}
              >
                <Share2 className="h-3 w-3" />
              </Badge>
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="border-border bg-background w-48 p-1">
        <ContextMenuItem
          onClick={() => onEditStart?.(item)}
          className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
        >
          <Edit2 className="mr-3 h-4 w-4" />
          Rename
        </ContextMenuItem>

        {item.type === "file" && (
          <ContextMenuItem
            onClick={() => onDownload?.(item.id)}
            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
          >
            <Download className="mr-3 h-4 w-4" />
            Download
          </ContextMenuItem>
        )}

        <ContextMenuItem
          onClick={() => onShare?.(item.id)}
          className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
        >
          <Share2 className="mr-3 h-4 w-4" />
          Share
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-border my-1" />

        <ContextMenuItem
          onClick={() => onDelete?.(item.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive dark:hover:bg-destructive/20 dark:focus:bg-destructive/20 cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
        >
          <Trash2 className="mr-3 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

