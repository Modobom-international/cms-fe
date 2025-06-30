"use client";

import { useMemo, useState } from "react";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import { toast } from "sonner";

import { IBreadcrumbItem, IFileItem, IFolderItem } from "@/types/storage.type";

import { useFileStructure } from "@/hooks/storage";

import { ScrollArea } from "@/components/ui/scroll-area";

import { FileDetailsPanel } from "@/components/storage/file-details-panel";
import { FilePreviewDialog } from "@/components/storage/file-preview-dialog";
import { FloatingToolbar } from "@/components/storage/floating-toolbar";
import { GridView } from "@/components/storage/grid-view";
import { ListView } from "@/components/storage/list-view";
import { StorageBreadcrumb } from "@/components/storage/storage-breadcrumb";
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
    showDetailsPanel,
    currentPath,
    setCurrentPath,
  } = useStorageStore();

  const [imagePreviewFile, setImagePreviewFile] = useState<IFileItem | null>(
    null
  );
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  // Fetch file structure from MinIO
  const {
    data: fileStructureData,
    isLoading: isLoadingFiles,
    error,
  } = useFileStructure(currentPath === "/" ? "" : currentPath);

  // Generate breadcrumbs from current path
  const breadcrumbs = useMemo((): IBreadcrumbItem[] => {
    if (currentPath === "/" || !currentPath) {
      return [{ id: "root", name: "Home", path: "/" }];
    }

    const pathParts = currentPath.split("/").filter(Boolean);
    const breadcrumbItems: IBreadcrumbItem[] = [
      { id: "root", name: "Home", path: "/" },
    ];

    let accumulatedPath = "";
    pathParts.forEach((part, index) => {
      accumulatedPath += part + "/";
      breadcrumbItems.push({
        id: `folder-${index}`,
        name: part,
        path: accumulatedPath,
      });
    });

    return breadcrumbItems;
  }, [currentPath]);

  // Filter and sort items based on sort settings
  const filteredAndSortedItems = useMemo(() => {
    if (!fileStructureData) {
      return { folders: [], files: [] };
    }

    const allItems = [...fileStructureData.folders, ...fileStructureData.files];

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
  }, [fileStructureData, sortBy, sortOrder]);

  const handleFolderClick = (folderId: string) => {
    // Find the folder to get its path
    const folder = filteredAndSortedItems.folders.find(
      (f) => f.id === folderId
    );
    if (folder) {
      setCurrentPath(folder.path);
      clearSelection();
    }
  };

  const handleFileClick = (file: IFileItem) => {
    setImagePreviewFile(file);
    setIsImagePreviewOpen(true);
  };

  const handleRename = (itemId: string, newName: string) => {
    toast.success(`Renamed to "${newName}"`);
  };

  const handleDownload = (itemId: string) => {
    // Find the file to get its download URL
    const file = filteredAndSortedItems.files.find((f) => f.id === itemId);
    if (file && "downloadUrl" in file) {
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = file.downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleDelete = () => {
    toast.success("Item deleted");
  };

  const handleShare = (itemId: string) => {
    // Find the file to get its public URL
    const file = filteredAndSortedItems.files.find((f) => f.id === itemId);
    if (file && "downloadUrl" in file) {
      navigator.clipboard.writeText(file.downloadUrl);
      toast.success("Share link copied to clipboard");
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column as any);
      setSortOrder("asc");
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load files</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const isLoadingState = isLoadingFiles;

  return (
    <div className="bg-background flex h-full gap-x-4">
      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <StorageToolbar
          itemCount={
            filteredAndSortedItems.folders.length +
            filteredAndSortedItems.files.length
          }
        />

        {/* Breadcrumb */}
        <StorageBreadcrumb
          breadcrumbs={breadcrumbs}
          onNavigate={(path) => {
            setCurrentPath(path);
            clearSelection();
          }}
        />

        {/* Main Content */}
        {showDetailsPanel ? (
          <ScrollArea className="bg-background h-[calc(100vh-20rem)] pr-1 [&>[data-slot=scroll-area-scrollbar]]:w-1.5">
            <div className="p-0">
              {isLoadingState ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground text-sm">
                      Loading files...
                    </p>
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
          </ScrollArea>
        ) : (
          <div className="bg-background min-h-[calc(100vh-20rem)] flex-1 overflow-auto">
            {isLoadingState ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <p className="text-muted-foreground text-sm">
                    Loading files...
                  </p>
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
        )}

        {/* Floating Toolbar */}
        <FloatingToolbar />
      </div>

      {/* File Details Panel Sidebar */}
      <section>{showDetailsPanel && <FileDetailsPanel />}</section>

      {/* Image Preview Dialog */}
      <FilePreviewDialog
        isOpen={isImagePreviewOpen}
        onOpenChange={setIsImagePreviewOpen}
        file={imagePreviewFile}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  );
}

