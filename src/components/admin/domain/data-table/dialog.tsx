"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEcho } from "@/components/context/echo";
import { Spinner } from "@/components/global/spinner";

interface RefreshDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refreshDomains: (data: undefined, options: any) => void;
  isRefreshing: boolean;
  refetch: () => void;
}

export function RefreshDialog({
  isOpen,
  onOpenChange,
  refreshDomains,
  isRefreshing,
  refetch,
}: RefreshDialogProps) {
  const t = useTranslations("DomainPage.table");
  const [refreshMessage, setRefreshMessage] = useState(
    t("modal.refresh.messages.initializing")
  );

  const echo = useEcho();

  useEffect(() => {
    if (isOpen) {
      setRefreshMessage(t("modal.refresh.messages.sending"));

      refreshDomains(undefined, {
        onSuccess: () => {
          setRefreshMessage(t("modal.refresh.messages.waiting"));
        },
        onError: () => {
          setRefreshMessage(t("modal.refresh.messages.error"));
        },
      });
    }
  }, [isOpen, refreshDomains, t]);

  useEffect(() => {
    if (isOpen) {
      echo
        .channel("domains")
        .listen("RefreshDomain", (e: { message: string }) => {
          setRefreshMessage(e.message);
        });

      return () => {
        echo.leaveChannel("domains");
      };
    }
  }, [isOpen, echo]);

  const handleClose = () => {
    onOpenChange(false);
    refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("modal.refresh.title")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isRefreshing ? (
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">{refreshMessage}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRefreshing}
          >
            {t("modal.refresh.button.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
