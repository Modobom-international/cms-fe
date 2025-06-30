"use client";

import { useState } from "react";

import Image from "next/image";

import { Download, Share2, ZoomIn, ZoomOut } from "lucide-react";

import { IFileItem } from "@/types/storage.type";

import { getCurrentTimezoneInfo } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { formatFileSize, isImageFile } from "./utils";

interface FilePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: IFileItem | null;
  onDownload?: (fileId: string) => void;
  onShare?: (fileId: string) => void;
}

export function FilePreviewDialog({
  isOpen,
  onOpenChange,
  file,
  onDownload,
  onShare,
}: FilePreviewDialogProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const { convertedTime, timezoneFormat } = getCurrentTimezoneInfo(
    file?.modifiedDate
  );

  if (!file) return null;

  const isImage = isImageFile(file.mimeType);

  const handleDownload = () => {
    onDownload?.(file.id);
  };

  const handleShare = () => {
    onShare?.(file.id);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle hidden></DialogTitle>
      <DialogContent className="bg-background max-h-[95vh] min-w-full gap-0 overflow-hidden border-0 p-0 lg:min-w-7xl">
        {/* Header with gradient */}
        <div className="from-background/95 via-background/90 to-background/95 border-border/50 relative border-b bg-gradient-to-r backdrop-blur-md">
          <div className="flex items-center justify-between p-6">
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground mb-2 truncate text-xl font-semibold">
                {file.name}
              </h3>
              <div className="text-muted-foreground flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Size:</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-medium">Modified:</span>
                  <span className="flex gap-x-1">
                    {convertedTime}
                    <span className="text-muted-foreground">
                      ({timezoneFormat})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="ml-6 flex items-center gap-2">
              {isImage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="h-9 w-9 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="h-9 px-3 text-xs font-medium"
                  >
                    {Math.round(zoom * 100)}%
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="h-9 w-9 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <div className="bg-border mx-2 h-6 w-px" />
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="bg-background/50 hover:bg-background/80 gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-background/50 hover:bg-background/80 gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="from-background/10 via-muted/5 to-background/10 relative flex-1 overflow-hidden bg-gradient-to-br">
          <div className="via-background/5 absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-transparent" />

          <div className="relative flex h-full min-h-[60vh] items-center justify-center overflow-auto p-8">
            {isImage ? (
              <>
                {!imageLoaded && !imageError && (
                  <div className="text-muted-foreground flex flex-col items-center gap-4">
                    <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
                    <p className="text-sm">Loading image...</p>
                  </div>
                )}

                {imageError && (
                  <div className="text-muted-foreground flex flex-col items-center gap-4 p-8">
                    <div className="text-6xl opacity-50">🖼️</div>
                    <div className="text-center">
                      <p className="mb-2 text-lg font-medium">
                        Unable to load image
                      </p>
                      <p className="text-sm opacity-75">{file.name}</p>
                    </div>
                  </div>
                )}

                <div
                  className="relative h-full"
                  style={{
                    transform: `scale(${zoom})`,
                    display: imageLoaded ? "block" : "none",
                  }}
                >
                  <Image
                    src={file.downloadUrl}
                    alt={file.name}
                    width={1920}
                    height={1080}
                    quality={95}
                    className="rounded-lg shadow-2xl transition-transform duration-300 ease-out"
                    style={{ height: "100%", width: "auto" }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                    sizes="100vw"
                    priority
                  />
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-6 p-8 text-center">
                <div className="text-6xl opacity-50">📄</div>
                <div>
                  <p className="mb-2 text-lg font-medium">
                    No preview available
                  </p>
                  <p className="text-sm opacity-75">
                    Cannot preview this file type.
                  </p>
                </div>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with additional info */}
        <div className="border-border/50 bg-muted/30 border-t px-6 py-3">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Use scroll wheel or zoom buttons to adjust size</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

