"use client";

import { useMemo, useState } from "react";

import { sampleFiles, sampleFolders } from "@/data/storage";
import { useStorageStore } from "@/stores/storage/useStorageStore";
import { toast } from "sonner";

import { IFileItem, IFolderItem } from "@/types/storage.type";

import { FloatingSidebar } from "@/components/storage/floating-sidebar";
import { GridView } from "@/components/storage/grid-view";
import { ListView } from "@/components/storage/list-view";
import { StorageToolbar } from "@/components/storage/storage-toolbar";

export function StorageContent() {
  const {
    viewMode,
    sortBy,
    sortOrder,
    selectedItems,
    clearSelection,
    setSortBy,
    setSortOrder,
  } = useStorageStore();

  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort items based on sort settings
  const filteredAndSortedItems = useMemo(() => {
    const allItems = [...sampleFolders, ...sampleFiles];

    // Sort items
    allItems.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "modified":
          comparison =
            new Date(a.modifiedDate).getTime() -
            new Date(b.modifiedDate).getTime();
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return {
      folders: allItems.filter(
        (item) => item.type === "folder"
      ) as IFolderItem[],
      files: allItems.filter((item) => item.type === "file") as IFileItem[],
    };
  }, [sortBy, sortOrder]);

  const handleFolderClick = (folderId: string, folderName: string) => {
    toast.info(`Navigating to ${folderName}...`);
    clearSelection();
  };

  const handleFileClick = (file: IFileItem) => {
    toast.info(`Opening ${file.name}...`);
  };

  const handleRename = (itemId: string, newName: string) => {
    toast.success(`Renamed to "${newName}"`);
  };

  const handleDownload = (itemId: string) => {
    toast.success("Download started");
  };

  const handleDelete = (itemId: string) => {
    toast.success("Item deleted");
  };

  const handleShare = (itemId: string) => {
    toast.success("Share link copied to clipboard");
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column as any);
      setSortOrder("asc");
    }
  };

  return (
    <div className="h-full">
      {/* Toolbar */}
      <StorageToolbar
        itemCount={
          filteredAndSortedItems.folders.length +
          filteredAndSortedItems.files.length
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Processing...</p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <GridView
            files={filteredAndSortedItems.files}
            folders={filteredAndSortedItems.folders}
            onFolderClick={handleFolderClick}
            onFileClick={handleFileClick}
            onRename={handleRename}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        ) : (
          <ListView
            files={filteredAndSortedItems.files}
            folders={filteredAndSortedItems.folders}
            onFolderClick={handleFolderClick}
            onFileClick={handleFileClick}
            onRename={handleRename}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onShare={handleShare}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Floating Sidebar */}
      <FloatingSidebar />
    </div>
  );
}
