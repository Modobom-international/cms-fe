"use client";

import React, { useState } from "react";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import { Folder } from "lucide-react";

import { IFileItem, IFolderItem } from "@/types/storage.type";

import { ShareFileDialog } from "./share-file-dialog";
import { StorageCard } from "./storage-card";

interface GridViewProps {
  files: IFileItem[];
  folders: IFolderItem[];
  onFolderClick?: (folderId: string, folderName: string) => void;
  onFileClick?: (file: IFileItem) => void;
  onRename?: (itemId: string, newName: string) => void;
  onDownload?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
  onImageClick?: (file: IFileItem) => void;
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
  onImageClick,
}: GridViewProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedItemForShare, setSelectedItemForShare] = useState<
    IFileItem | IFolderItem | null
  >(null);
  const { selectedItems, toggleSelection } = useStorageStore();

  const handleItemClick = (
    item: IFileItem | IFolderItem,
    e: React.MouseEvent
  ) => {
    if (item.type === "folder") {
      onFolderClick?.(item.id, item.name);
    } else {
      onFileClick?.(item);
    }
  };

  const handleSelectionToggle = (itemId: string, e: React.MouseEvent) => {
    toggleSelection(itemId, true);
  };

  const handleEditStart = (item: IFileItem | IFolderItem) => {
    setEditingItem(item.id);
    setEditingName(item.name);
  };

  const handleEditSubmit = (itemId: string, newName: string) => {
    if (newName.trim() && newName !== "") {
      onRename?.(itemId, newName.trim());
    }
    setEditingItem(null);
    setEditingName("");
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditingName("");
  };

  const handleShare = (itemId: string) => {
    const allItems = [...folders, ...files];
    const item = allItems.find((item) => item.id === itemId);
    if (item) {
      setSelectedItemForShare(item);
      setShareDialogOpen(true);
    }
    onShare?.(itemId);
  };

  const allItems = [...folders, ...files];

  if (allItems.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
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
    <div className="grid grid-cols-2 gap-4 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {allItems.map((item) => (
        <StorageCard
          key={item.id}
          item={item}
          isSelected={selectedItems.includes(item.id)}
          isEditing={editingItem === item.id}
          editingName={editingName}
          onItemClick={handleItemClick}
          onSelectionToggle={handleSelectionToggle}
          onEditStart={handleEditStart}
          onEditSubmit={handleEditSubmit}
          onEditCancel={handleEditCancel}
          onEditNameChange={setEditingName}
          onRename={onRename}
          onDownload={onDownload}
          onDelete={onDelete}
          onShare={handleShare}
          onImageClick={onImageClick}
        />
      ))}

      {/* Share Dialog */}
      {selectedItemForShare && (
        <ShareFileDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          fileName={selectedItemForShare.name}
          fileType={selectedItemForShare.type}
        />
      )}
    </div>
  );
}

