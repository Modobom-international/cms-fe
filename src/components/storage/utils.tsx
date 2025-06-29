import { Archive, File, FileText, Image, Music, Video } from "lucide-react";

import { cn } from "@/lib/utils";

import { Icons } from "@/components/ui/icons";

export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
};

export const getFileTypeIcon = (
  mimeType: string,
  size: "sm" | "md" | "lg" = "md"
) => {
  // Define size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "size-32",
  };

  const iconSize = sizeClasses[size];

  if (mimeType === "folder" || mimeType === "application/x-directory") {
    return (
      <Icons.folder
        className={cn(
          iconSize,
          iconSize === "lg" ? "size-32" : "",
          "text-blue-500 dark:text-blue-400"
        )}
      />
    );
  }

  if (mimeType.startsWith("image/"))
    return (
      <Icons.image
        className={cn(iconSize, iconSize === "lg" ? "size-32" : "")}
      />
    );
  if (mimeType.startsWith("video/"))
    return (
      <Video className={cn(iconSize, "text-rose-500 dark:text-rose-400")} />
    );
  if (mimeType.startsWith("audio/"))
    return (
      <Music className={cn(iconSize, "text-violet-500 dark:text-violet-400")} />
    );
  if (mimeType.includes("pdf"))
    return (
      <Icons.pdf className={cn(iconSize, iconSize === "lg" ? "size-32" : "")} />
    );
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return (
      <Archive className={cn(iconSize, "text-amber-500 dark:text-amber-400")} />
    );
  if (mimeType.includes("docx"))
    return (
      <Icons.MsWord
        className={cn(iconSize, iconSize === "lg" ? "size-32" : "")}
      />
    );
  return (
    <File className={cn(iconSize, "text-slate-500 dark:text-slate-400")} />
  );
};

export function isImageFile(mimeType: string): boolean {
  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
    "image/ico",
    "image/heic",
    "image/heif",
  ];

  return imageTypes.includes(mimeType.toLowerCase());
}

export function isOfficeDocument(mimeType: string): boolean {
  const officeTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ];
  return officeTypes.includes(mimeType.toLowerCase());
}

export function isPreviewableDocument(mimeType: string): boolean {
  const documentTypes = [
    "application/pdf",
    "text/plain",
    "text/csv",
    "text/html",
    "application/json",
  ];

  // Exclude office documents since they require special handling
  if (isOfficeDocument(mimeType)) {
    return false;
  }

  return documentTypes.includes(mimeType.toLowerCase());
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop() || "";
}

