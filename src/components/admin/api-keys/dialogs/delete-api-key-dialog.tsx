"use client";

import { cloneElement, ReactElement, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { IApiKey } from "@/types/api-key.type";

import { useDeleteApiKey } from "@/hooks/api-key";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DeleteApiKeyDialogProps {
  apiKey: IApiKey;
  trigger?: ReactElement;
}

export default function DeleteApiKeyDialog({
  apiKey,
  trigger,
}: DeleteApiKeyDialogProps) {
  const t = useTranslations("ApiKeyPage.dialogs.delete");
  const tNotifications = useTranslations("ApiKeyPage.notifications");

  const [isOpen, setIsOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");

  const { useDeleteApiKeyMutation } = useDeleteApiKey(apiKey.id.toString());
  const { mutateAsync: deleteApiKey, isPending } = useDeleteApiKeyMutation;

  const isConfirmationValid = confirmationName === apiKey.name;

  const onDelete = async () => {
    if (!isConfirmationValid) {
      toast.error(t("error.nameRequired"));
      return;
    }

    try {
      await deleteApiKey();
      toast.success(tNotifications("deleted"));
      handleClose();
    } catch {
      toast.error(tNotifications("error"));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setConfirmationName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild onClick={() => setIsOpen(true)}>
          {cloneElement(trigger)}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-left">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Notice */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="">
                <h3 className="text-sm font-medium text-red-800">
                  {t("warning.title")}
                </h3>
                <div className="mt-2 text-sm tracking-tighter text-red-700">
                  <p>{t("warning.message")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {t("confirmation.label")}
              <span className="mx-1 rounded-md bg-red-100 px-1 py-0.5 font-mono text-red-800">
                {apiKey.name}
              </span>
              {t("confirmation.suffix")}
            </p>
            <Input
              id="confirmation-name"
              type="text"
              placeholder={t("confirmation.placeholder")}
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              className={
                confirmationName && !isConfirmationValid
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }
            />
            {confirmationName && !isConfirmationValid && (
              <p className="text-xs text-red-600">
                {t("confirmation.mismatch")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={!isConfirmationValid || isPending}
            className="min-w-[100px]"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("buttons.deleting")}
              </div>
            ) : (
              <>{t("buttons.delete")}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
