import { storageQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { IFileItem, IFolderItem } from "@/types/storage.type";

import {
  getPresignedUrls,
  handleUpload,
  MAX_FILE_SIZE_S3_ENDPOINT,
  validateFiles,
} from "@/lib/client/minio";

interface FileStructureResponse {
  folders: IFolderItem[];
  files: IFileItem[];
}

interface UploadFileInfo {
  originalFileName: string;
  fileSize: number;
}

export function useFileStructure(prefix: string = "") {
  return useQuery<FileStructureResponse>({
    queryKey: storageQueryKeys.fileStructure(prefix),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (prefix) {
        searchParams.set("prefix", prefix);
      }

      const response = await fetch(
        `/api/storage/files?${searchParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch file structure");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: storageQueryKeys.upload(),
    mutationFn: async ({ files }: { files: File[] }) => {
      // Prepare file information for presigned URL generation
      const fileInfos: UploadFileInfo[] = files.map((file) => ({
        originalFileName: file.name,
        fileSize: file.size,
      }));

      // Validate files
      const validationError = validateFiles(
        fileInfos,
        MAX_FILE_SIZE_S3_ENDPOINT
      );
      if (validationError) {
        throw new Error(validationError);
      }

      // Get presigned URLs from the new storage endpoint
      const presignedUrls = await getPresignedUrls(
        fileInfos,
        "/api/storage/presigned"
      );

      // Upload files using presigned URLs
      return new Promise((resolve, reject) => {
        handleUpload(files, presignedUrls, () => {
          resolve(undefined);
        }).catch(reject);
      });
    },
    onSuccess: () => {
      // Invalidate file structure queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: storageQueryKeys.fileStructure(),
      });
      toast.success("Files uploaded successfully");
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload files");
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: storageQueryKeys.createFolder(),
    mutationFn: async ({ folderName }: { folderName: string }) => {
      if (!folderName.trim()) {
        throw new Error("Folder name cannot be empty");
      }

      // Create a placeholder file to represent the folder
      const placeholderFile = new File([""], ".gitkeep", {
        type: "text/plain",
      });
      const fileInfo: UploadFileInfo = {
        originalFileName: `${folderName}/.gitkeep`,
        fileSize: placeholderFile.size,
      };

      // Get presigned URL for the placeholder file
      const presignedUrls = await getPresignedUrls(
        [fileInfo],
        "/api/storage/presigned"
      );

      // Upload the placeholder file
      return new Promise((resolve, reject) => {
        handleUpload([placeholderFile], presignedUrls, () => {
          resolve(undefined);
        }).catch(reject);
      });
    },
    onSuccess: (_, { folderName }) => {
      // Invalidate file structure queries to refresh the UI
      queryClient.invalidateQueries({
        queryKey: storageQueryKeys.fileStructure(),
      });
      toast.success(`Folder "${folderName}" created successfully`);
    },
    onError: (error: Error) => {
      console.error("Create folder error:", error);
      toast.error(error.message || "Failed to create folder");
    },
  });
}

export function useRefreshFileStructure() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      return queryClient.invalidateQueries({
        queryKey: storageQueryKeys.fileStructure(),
      });
    },
    refreshPrefix: (prefix: string) => {
      return queryClient.invalidateQueries({
        queryKey: storageQueryKeys.fileStructure(prefix),
      });
    },
  };
}
