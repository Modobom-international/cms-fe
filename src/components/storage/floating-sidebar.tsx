"use client";

import React from "react";

import { sampleFiles, sampleFolders } from "@/data/storage";
import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  Copy,
  Download,
  Edit2,
  File,
  Folder,
  Info,
  Move,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function FloatingSidebar() {
  const { selectedItems, clearSelection } = useStorageStore();

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
        toast.info("Details panel");
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
    <div className="fixed top-1/2 right-6 z-50 w-80 -translate-y-1/2 transform rounded-xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {selectedItems.length}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {selectedItems.length === 1
                ? "1 item"
                : `${selectedItems.length} items`}
            </h3>
            <p className="text-xs text-gray-500">selected</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Items Preview */}
      <div className="p-4">
        <ScrollArea className="max-h-24">
          <div className="space-y-2">
            {selectedItemDetails.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="flex h-6 w-6 items-center justify-center">
                  {item.type === "folder" ? (
                    <Folder className="h-4 w-4 text-blue-500" />
                  ) : (
                    <File className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
            {selectedItems.length > 3 && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="h-6 w-6" />
                <span>and {selectedItems.length - 3} more...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="mx-4" />

      {/* Primary Actions */}
      <div className="p-4">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("download")}
            className="w-full justify-start border-gray-200 hover:bg-gray-50"
          >
            <Download className="mr-3 h-4 w-4 text-gray-600" />
            <span className="font-medium">Download</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("share")}
            className="w-full justify-start border-gray-200 hover:bg-gray-50"
          >
            <Share2 className="mr-3 h-4 w-4 text-gray-600" />
            <span className="font-medium">Share</span>
          </Button>

          {selectedItems.length === 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("rename")}
              className="w-full justify-start border-gray-200 hover:bg-gray-50"
            >
              <Edit2 className="mr-3 h-4 w-4 text-gray-600" />
              <span className="font-medium">Rename</span>
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="mt-3 grid grid-cols-3 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("copy")}
            className="h-auto flex-col gap-1 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" />
            <span className="text-xs">Copy</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("move")}
            className="h-auto flex-col gap-1 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Move className="h-4 w-4" />
            <span className="text-xs">Move</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("star")}
            className="h-auto flex-col gap-1 py-2 text-gray-600 hover:bg-gray-50"
          >
            <Star className="h-4 w-4" />
            <span className="text-xs">Star</span>
          </Button>
        </div>

        <Separator className="my-3" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("delete")}
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="mr-3 h-4 w-4" />
          <span className="font-medium">Delete</span>
        </Button>
      </div>

      {/* Item Details - Only show for single selection */}
      {selectedItems.length === 1 && selectedItemDetails.length > 0 && (
        <>
          <Separator className="mx-4" />
          <div className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {selectedItemDetails[0].type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Size</span>
                  <span className="font-medium text-gray-900">
                    {selectedItemDetails[0].type === "folder"
                      ? `${(selectedItemDetails[0] as any).itemCount} items`
                      : formatFileSize(selectedItemDetails[0].size)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Modified</span>
                  <span className="font-medium text-gray-900">
                    {selectedItemDetails[0].modifiedDate}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Owner</span>
                  <span className="font-medium text-gray-900">
                    {selectedItemDetails[0].owner}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
