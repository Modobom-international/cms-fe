"use client";

import React, { useState } from "react";

import Image from "next/image";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Download, Share2, ZoomIn, ZoomOut } from "lucide-react";

import { IFileItem } from "@/types/storage.type";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  formatFileSize,
  getFileExtension,
  isImageFile,
  isOfficeDocument,
  isPreviewableDocument,
} from "./utils";

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
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Reset states when file changes and fetch document if needed
  React.useEffect(() => {
    let objectUrl: string | null = null;

    if (isOpen && file) {
      // Reset states
      setImageLoaded(false);
      setImageError(false);
      setZoom(1);
      setDocumentUri(null);
      setDocumentError(null);
      setJsonContent(null);
      setTextContent(null);

      const isDocument = isPreviewableDocument(file.mimeType);
      const isJson = file.mimeType === "application/json";
      const isText = file.mimeType === "text/plain";

      if (isDocument) {
        fetch(file.downloadUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to fetch document: ${response.statusText}`
              );
            }
            if (isJson) {
              return response.json();
            } else if (isText) {
              return response.text();
            } else {
              return response.blob();
            }
          })
          .then((data) => {
            if (isJson) {
              setJsonContent(JSON.stringify(data, null, 2));
            } else if (isText) {
              setTextContent(data as string);
            } else {
              objectUrl = URL.createObjectURL(data as Blob);
              setDocumentUri(objectUrl);
            }
          })
          .catch((error) => {
            console.error("Failed to load document for preview:", error);
            setDocumentError(
              isJson
                ? "This file appears to be invalid JSON."
                : isText
                  ? "This file appears to be invalid text."
                  : "Sorry, we couldn't load this document for preview."
            );
          });
      }
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, isOpen]);

  if (!file) return null;

  const isImage = isImageFile(file.mimeType);
  const isDocument = isPreviewableDocument(file.mimeType);
  const isOfficeDoc = isOfficeDocument(file.mimeType);

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

  const fileType = getFileExtension(file.name);
  const documents = documentUri ? [{ uri: documentUri, fileType }] : [];

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
                <div className="flex items-center gap-1">
                  <span className="font-medium">Modified:</span>
                  <span>
                    {new Date(file.modifiedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Zoom:</span>
                  <span>{Math.round(zoom * 100)}%</span>
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
            {isImage && (
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
                  className="relative max-h-full max-w-full"
                  style={{
                    transform: `scale(${zoom})`,
                    display: imageLoaded ? "block" : "none",
                    width: "fit-content",
                    height: "fit-content",
                  }}
                >
                  <Image
                    src={file.downloadUrl}
                    alt={file.name}
                    width={800}
                    height={600}
                    className="rounded-lg object-contain shadow-2xl transition-transform duration-300 ease-out"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority
                  />
                </div>
              </>
            )}
            {isDocument && (
              <>
                {!documentUri &&
                  !documentError &&
                  !jsonContent &&
                  !textContent && (
                    <div className="text-muted-foreground flex flex-col items-center gap-4">
                      <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
                      <p className="text-sm">Loading document preview...</p>
                    </div>
                  )}
                {documentError && (
                  <div className="text-muted-foreground flex flex-col items-center gap-4 p-8 text-center">
                    <div className="text-6xl opacity-50">⚠️</div>
                    <p className="mb-2 text-lg font-medium">
                      Preview Unavailable
                    </p>
                    <p className="text-sm opacity-75">{documentError}</p>
                  </div>
                )}
                {(jsonContent || textContent) && (
                  <ScrollArea className="bg-muted/50 h-[calc(100vh-20rem)] w-full rounded-lg p-4">
                    <pre className="text-foreground/90 font-mono text-sm break-words whitespace-pre-wrap">
                      {jsonContent || textContent}
                    </pre>
                  </ScrollArea>
                )}
                {documentUri && !jsonContent && !textContent && (
                  <DocViewer
                    documents={documents}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableHeader: true,
                      },
                      csvDelimiter: ",",
                      pdfVerticalScrollByDefault: true,
                    }}
                    className="h-full w-full"
                    theme={{
                      primary: "#f4f4f5",
                      secondary: "#a1a1aa",
                      tertiary: "#52525b",
                      textPrimary: "#09090b",
                      textSecondary: "#71717a",
                      textTertiary: "#ffffff",
                      disableThemeScrollbar: false,
                    }}
                  />
                )}
              </>
            )}
            {(isOfficeDoc || (!isImage && !isDocument)) && (
              <div className="text-muted-foreground flex flex-col items-center gap-6 p-8 text-center">
                <div className="text-6xl opacity-50">📄</div>
                <div>
                  <p className="mb-2 text-lg font-medium">
                    No preview available
                  </p>
                  <p className="text-sm opacity-75">
                    {isOfficeDoc
                      ? "This file type can't be previewed in the browser."
                      : "Cannot preview this file type."}
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

