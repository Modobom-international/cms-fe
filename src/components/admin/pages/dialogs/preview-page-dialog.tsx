"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string;
  pageName: string;
}

export default function PreviewPageDialog({
  isOpen,
  onClose,
  previewUrl,
  pageName,
}: PreviewPageDialogProps) {
  const t = useTranslations("Studio.Sites.Pages");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-full max-h-[95vh] w-full max-w-[95vw] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Preview: {pageName}</span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 p-6 pt-2">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="h-[80vh] w-full rounded-lg border border-gray-200"
              title={`Preview of ${pageName}`}
              onError={() => {
                console.error("Failed to load preview:", previewUrl);
              }}
            />
          ) : (
            <div className="text-muted-foreground flex h-[80vh] items-center justify-center">
              <div className="text-center">
                <p>{t("PreviewExported")}</p>
                <p className="mt-2 text-sm">
                  {t("PreviewExportedDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
