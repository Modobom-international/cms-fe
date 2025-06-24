"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

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
import { Label } from "@/components/ui/label";

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
          <DialogDescription className="text-muted-foreground">
            {t("Delete.Dialog.Description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              {t("Delete.Dialog.ConfirmationText")}{" "}
              <span className="text-destructive font-medium">{pageName}</span>{" "}
              {t("Delete.Dialog.ConfirmationText2")}
            </Label>
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
