"use client";

import { useRef, useState } from "react";

import { Files, FolderPlus, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  getPresignedUrls,
  handleUpload,
  MAX_FILE_SIZE_S3_ENDPOINT,
  validateFiles,
} from "@/lib/client/minio";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateUploadDropdownProps {
  onCreateFolder?: () => void;
  onUploadFile?: () => void;
  onUploadFolder?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function CreateUploadDropdown({
  onCreateFolder,
  onUploadFile,
  onUploadFolder,
  onRefresh,
  className,
}: CreateUploadDropdownProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const fileArray = Array.from(files);

      // Prepare file information for presigned URL generation
      const fileInfos = fileArray.map((file) => ({
        originalFileName: file.name,
        fileSize: file.size,
      }));

      // Validate files
      const validationError = validateFiles(
        fileInfos,
        MAX_FILE_SIZE_S3_ENDPOINT
      );
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Get presigned URLs
      const presignedUrls = await getPresignedUrls(fileInfos);

      // Upload files using presigned URLs
      await handleUpload(fileArray, presignedUrls, () => {
        toast.success(`Successfully uploaded ${fileArray.length} file(s)`);
        onUploadFile?.();
        onRefresh?.();
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleCreateFolder = () => {
    setShowCreateFolderDialog(true);
  };

  const handleCreateFolderSubmit = async () => {
    if (!folderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try {
      // In S3, folders are created by uploading an empty object with the folder prefix
      // Create a placeholder file to represent the folder
      const placeholderFile = new File([""], ".gitkeep", {
        type: "text/plain",
      });
      const fileInfo = {
        originalFileName: `${folderName}/.gitkeep`,
        fileSize: placeholderFile.size,
      };

      // Get presigned URL for the placeholder file
      const presignedUrls = await getPresignedUrls([fileInfo]);

      // Upload the placeholder file
      await handleUpload([placeholderFile], presignedUrls, () => {
        toast.success(`Folder "${folderName}" created successfully`);
        onCreateFolder?.();
        onRefresh?.();
        setShowCreateFolderDialog(false);
        setFolderName("");
      });
    } catch (error) {
      console.error("Create folder error:", error);
      toast.error("Failed to create folder");
    }
  };

  return (
    <>
      <div className={cn("mb-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              disabled={isUploading}
              className="from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-primary/25 hover:shadow-primary/30 relative h-10 w-32 justify-start gap-4 overflow-hidden rounded-full border-0 bg-gradient-to-br px-5 font-semibold shadow-lg disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 opacity-0 transition-opacity duration-300" />
              <div className="relative flex size-5 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all duration-300">
                <Plus className="h-4 w-4 transition-transform duration-300" />
              </div>
              <span className="relative text-sm font-medium tracking-wide">
                {isUploading ? "Uploading..." : "New"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-background/80 border-border w-72 rounded-2xl border shadow-2xl backdrop-blur-xl"
            sideOffset={12}
          >
            <DropdownMenuItem
              onClick={handleCreateFolder}
              className="group hover:bg-primary/10 h-12 cursor-pointer rounded-lg px-4 transition-colors duration-150"
            >
              <div className="bg-primary/20 group-hover:bg-primary/30 mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                <FolderPlus className="text-primary size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  Create folder
                </span>
                <span className="text-muted-foreground text-xs">
                  New folder to organize files
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleUploadFileClick}
              disabled={isUploading}
              className="group hover:bg-primary/10 h-12 cursor-pointer rounded-lg px-4 transition-colors duration-150 disabled:opacity-50"
            >
              <div className="bg-primary/20 group-hover:bg-primary/30 mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                <Upload className="text-primary size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  Upload file
                </span>
                <span className="text-muted-foreground text-xs">
                  Upload from your device
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleUploadFolderClick}
              disabled={isUploading}
              className="group hover:bg-primary/10 h-12 cursor-pointer rounded-lg px-4 transition-colors duration-150 disabled:opacity-50"
            >
              <div className="bg-primary/20 group-hover:bg-primary/30 mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                <Files className="text-primary size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  Upload folder
                </span>
                <span className="text-muted-foreground text-xs">
                  Upload entire folder structure
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: "" } as any)}
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Create Folder Dialog */}
      <Dialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolderSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateFolderDialog(false);
                setFolderName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolderSubmit}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

