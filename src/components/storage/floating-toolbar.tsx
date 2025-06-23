"use client";

import React, { useState } from "react";

import { sampleFiles, sampleFolders } from "@/data/storage";
import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  Copy,
  Download,
  Edit2,
  File,
  Folder,
  Info,
  MoreHorizontal,
  Move,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function FloatingToolbar() {
  const { selectedItems } = useStorageStore();
  const [showDetails, setShowDetails] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  // Get selected item details
  const allItems = [...sampleFolders, ...sampleFiles];
  const selectedItemDetails = allItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const handleAction = (action: string) => {
    const count = selectedItems.length;
    switch (action) {
      case "download":
        toast.success(`Downloading ${count} item(s)`);
        break;
      case "share":
        toast.success(`Shared ${count} item(s)`);
        break;
      case "delete":
        toast.success(`Deleted ${count} item(s)`);
        break;
      case "copy":
        toast.success(`Copied ${count} item(s)`);
        break;
      case "move":
        toast.success(`Moving ${count} item(s)`);
        break;
      case "star":
        toast.success(`Starred ${count} item(s)`);
        break;
      case "rename":
        toast.info("Rename functionality");
        break;
      case "details":
        setShowDetails(!showDetails);
        break;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      {/* Main Toolbar */}
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
        {/* Selection Info */}
        <div className="mr-2 flex items-center gap-2">
          <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
            <span className="text-primary text-xs font-semibold">
              {selectedItems.length}
            </span>
          </div>
          <span className="hidden text-sm font-medium text-gray-900 sm:block">
            {selectedItems.length === 1
              ? "1 item"
              : `${selectedItems.length} items`}
          </span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("download")}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Download"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("share")}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Share"
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>

          {selectedItems.length === 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("rename")}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Rename"
            >
              <Edit2 className="h-4 w-4 text-gray-600" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("copy")}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Copy"
          >
            <Copy className="h-4 w-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("star")}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Star"
          >
            <Star className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* More Actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="More actions"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="center" side="top">
            <div className="space-y-1">
              {selectedItems.length === 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction("details")}
                  className="w-full justify-start"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Details
                </Button>
              )}
              <Separator className="my-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("delete")}
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Details Panel - Only show for single selection when toggled */}
      {showDetails &&
        selectedItems.length === 1 &&
        selectedItemDetails.length > 0 && (
          <div className="mt-2 w-80 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center">
                {selectedItemDetails[0].type === "folder" ? (
                  <Folder className="text-primary h-5 w-5" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {selectedItemDetails[0].name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {selectedItemDetails[0].type}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="font-medium text-gray-900">
                  {selectedItemDetails[0].type === "folder"
                    ? `${(selectedItemDetails[0] as any).itemCount} items`
                    : formatFileSize(selectedItemDetails[0].size)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modified</span>
                <span className="font-medium text-gray-900">
                  {selectedItemDetails[0].modifiedDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Owner</span>
                <span className="font-medium text-gray-900">
                  {selectedItemDetails[0].owner}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
