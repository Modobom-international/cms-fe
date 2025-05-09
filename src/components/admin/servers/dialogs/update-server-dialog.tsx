"use client";

import { useEffect, useState } from "react";

import { IUpdateServerForm } from "@/validations/server.validation";
import { useTranslations } from "next-intl";

import { IServer } from "@/types/server.type";

import { useUpdateServer } from "@/hooks/server";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface UpdateServerDialogProps {
  server: IServer;
  trigger: React.ReactNode;
}

export default function UpdateServerDialog({
  server,
  trigger,
}: UpdateServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("ServerPage");
  const { updateServerForm, updateServerMutation, isUpdating } =
    useUpdateServer(server.id.toString());

  useEffect(() => {
    updateServerForm.reset({
      name: server.name,
      ip: server.ip,
    });
  }, [server, updateServerForm]);

  const onSubmit = async (values: IUpdateServerForm) => {
    await updateServerMutation(values, {
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
          <DialogTitle>{t("dialog.updateServer.title")}</DialogTitle>
          <DialogDescription>
            {t("dialog.updateServer.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...updateServerForm}>
          <form
            onSubmit={updateServerForm.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={updateServerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.updateServer.form.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "dialog.updateServer.form.namePlaceholder"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateServerForm.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.updateServer.form.ip")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("dialog.updateServer.form.ipPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                {t("dialog.updateServer.form.cancel")}
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating
                  ? t("dialog.updateServer.form.updating")
                  : t("dialog.updateServer.form.update")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
