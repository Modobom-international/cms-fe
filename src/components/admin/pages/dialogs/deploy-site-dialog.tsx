"use client";

import { Rocket } from "lucide-react";
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

import { Spinner } from "@/components/global/spinner";

interface DeploySiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
  isDeploying: boolean;
}

export default function DeploySiteDialog({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isDeploying,
}: DeploySiteDialogProps) {
  const t = useTranslations("Studio.Sites.Pages.Deploy");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="text-primary h-5 w-5" />
            {t("DialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("DialogDescription")}
            <span className="text-primary font-semibold"> {siteName}</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeploying}
            className="w-full sm:w-auto"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeploying}
            className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
          >
            {isDeploying ? (
              <>
                <Spinner />
                {t("Loading")}
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                {t("Confirm")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
