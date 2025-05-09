"use client";

import { useState } from "react";

import { serverQueryKeys } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { IServer } from "@/types/server.type";

import { useDeleteServer } from "@/hooks/server";

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

interface DeleteServerDialogProps {
  server: IServer;
  trigger: React.ReactNode;
}

export default function DeleteServerDialog({
  server,
  trigger,
}: DeleteServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("ServerPage");
  const { deleteServerMutation, isDeleting } = useDeleteServer(
    server.id.toString()
  );

  const handleDelete = async () => {
    deleteServerMutation(server.id.toString(), {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("dialog.deleteServer.title")}</DialogTitle>
          <DialogDescription>
            {t("dialog.deleteServer.description", { name: server.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t("dialog.deleteServer.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? t("dialog.deleteServer.deleting")
              : t("dialog.deleteServer.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
