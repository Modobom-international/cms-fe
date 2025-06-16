"use client";

import { cloneElement, ReactElement, useEffect, useState } from "react";

import { IUpdateApiKeyForm } from "@/validations/api-key.validation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { IApiKey } from "@/types/api-key.type";

import { useUpdateApiKey } from "@/hooks/api-key";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface UpdateApiKeyDialogProps {
  apiKey: IApiKey;
  trigger?: ReactElement;
}

export default function UpdateApiKeyDialog({
  apiKey,
  trigger,
}: UpdateApiKeyDialogProps) {
  const t = useTranslations("ApiKeyPage.dialogs.update");
  const tNotifications = useTranslations("ApiKeyPage.notifications");

  const [isOpen, setIsOpen] = useState(false);

  const { updateApiKeyForm, useUpdateApiKeyMutation } = useUpdateApiKey(
    apiKey.id.toString()
  );

  const { handleSubmit, control, reset, formState } = updateApiKeyForm;
  const { isSubmitting, isDirty, dirtyFields } = formState;

  const { mutateAsync: updateApiKey, isPending } = useUpdateApiKeyMutation;

  // Pre-fill form with current values when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: apiKey.name,
        is_active: apiKey.is_active,
      });
    }
  }, [isOpen, apiKey, reset]);

  const onSubmit = async (data: IUpdateApiKeyForm) => {
    try {
      // Only send modified fields to the backend
      const modifiedData: Partial<IUpdateApiKeyForm> = {};

      if (dirtyFields.name) {
        modifiedData.name = data.name;
      }

      if (dirtyFields.is_active) {
        modifiedData.is_active = data.is_active;
      }

      // Only proceed if there are actual changes
      if (Object.keys(modifiedData).length === 0) {
        toast.info(tNotifications("noChanges"));
        handleClose();
        return;
      }

      await updateApiKey(modifiedData as IUpdateApiKeyForm);
      toast.success(tNotifications("updated"));
      handleClose();
    } catch {
      toast.error(tNotifications("error"));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    reset({
      name: "",
      is_active: false,
    });
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
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...updateApiKeyForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.name.placeholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.name.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Field */}
            <FormField
              control={control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t("form.isActive.label")}
                    </FormLabel>
                    <FormDescription>
                      {t("form.isActive.description")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                onClick={handleClose}
                disabled={isSubmitting || isPending}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isPending || !isDirty}
                className="min-w-[100px]"
              >
                {isSubmitting || isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("buttons.updating")}
                  </div>
                ) : (
                  <>{t("buttons.update")}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
