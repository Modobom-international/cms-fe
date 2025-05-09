"use client";

import { useState } from "react";

import { ICreateServerForm } from "@/validations/server.validation";
import { useTranslations } from "next-intl";

import { useCreateServer } from "@/hooks/server";

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

interface AddServerDialogProps {
  trigger: React.ReactNode;
}

export default function AddServerDialog({ trigger }: AddServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("ServerPage");

  const { createServerForm, createServerMutation, isCreating } =
    useCreateServer();

  const onSubmit = async (values: ICreateServerForm) => {
    createServerMutation(values, {
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
          <DialogTitle>{t("dialog.addServer.title")}</DialogTitle>
          <DialogDescription>
            {t("dialog.addServer.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...createServerForm}>
          <form
            onSubmit={createServerForm.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={createServerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.addServer.form.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("dialog.addServer.form.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createServerForm.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.addServer.form.ip")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("dialog.addServer.form.ipPlaceholder")}
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
                {t("dialog.addServer.form.cancel")}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating
                  ? t("dialog.addServer.form.creating")
                  : t("dialog.addServer.form.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

