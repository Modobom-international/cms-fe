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

interface DeletePageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pageName: string;
  isDeleting: boolean;
}

export default function DeletePageDialog({
  isOpen,
  onClose,
  onConfirm,
  pageName,
  isDeleting,
}: DeletePageDialogProps) {
  const t = useTranslations("Studio.Sites.Pages");
  const [confirmationText, setConfirmationText] = useState("");

  const handleClose = () => {
    setConfirmationText("");
    onClose();
  };

  const handleCopyPageName = async () => {
    try {
      await navigator.clipboard.writeText(pageName);
      toast.success("Page name copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy page name");
    }
  };

  const handleConfirm = () => {
    if (confirmationText === pageName) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("Delete.Dialog.Title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t("Delete.Dialog.Description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("Delete.Dialog.ConfirmationText")}{" "}
              <span
                className="text-destructive hover:bg-destructive/10 decoration-destructive/40 hover:decoration-destructive/80 cursor-pointer rounded px-1 py-0.5 font-medium underline decoration-dotted transition-colors duration-150 select-none"
                onClick={handleCopyPageName}
                title="Click to copy page name"
              >
                {pageName}
              </span>{" "}
              {t("Delete.Dialog.ConfirmationText2")}
            </p>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t("Delete.Dialog.InputPlaceholder")}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 space-x-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {t("Delete.Dialog.Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmationText !== pageName || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Spinner />
                {t("Delete.Dialog.Deleting")}
              </>
            ) : (
              t("Delete.Dialog.Confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
