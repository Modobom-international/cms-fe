"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Spinner } from "@/components/global/spinner";

interface DeleteSiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
  isDeleting: boolean;
}

export default function DeleteSiteDialog({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isDeleting,
}: DeleteSiteDialogProps) {
  const t = useTranslations("Studio.Sites.DeleteSite");
  const [confirmationText, setConfirmationText] = useState("");

  const handleCopySiteName = async () => {
    try {
      await navigator.clipboard.writeText(siteName);
      toast.success("Site name copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy site name");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>{t("Title")}</DialogTitle>
          <DialogDescription>
            {t("Description")}
            <span className="text-destructive font-semibold">
              {" "}
              {siteName}
            </span>{" "}
            {t("Description2")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("Confirmation.Text")}
              <span
                className="text-destructive hover:bg-destructive/10 decoration-destructive/40 hover:decoration-destructive/80 cursor-pointer rounded px-1 py-0.5 font-mono font-medium underline decoration-dotted transition-colors duration-150 select-none"
                onClick={handleCopySiteName}
                title="Click to copy site name"
              >
                {siteName}
              </span>
              {t("Confirmation.Text2")}
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t("Confirmation.Placeholder")}
              className="w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmationText !== siteName || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Spinner />
                {t("Deleting")}
              </>
            ) : (
              t("Delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

