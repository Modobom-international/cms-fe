"use client";

import React, { useState } from "react";

import { PLATFORMS } from "@/constants/platform";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Site,
  UpdateSitePlatformSchema,
  UpdateSitePlatformValues,
} from "@/types/site.type";

import { useUpdateSitePlatform } from "@/hooks/sites";

import { PlatformBadge } from "@/components/ui/badge/platform-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Spinner } from "@/components/global/spinner";

interface UpdatePlatformDialogProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdatePlatformDialog({
  site,
  isOpen,
  onClose,
}: UpdatePlatformDialogProps) {
  const t = useTranslations("Studio.Sites.UpdatePlatform");

  const form = useForm<UpdateSitePlatformValues>({
    resolver: zodResolver(UpdateSitePlatformSchema(t)),
    defaultValues: {
      platform: site?.platform || "google",
    },
  });

  const updatePlatformMutation = useUpdateSitePlatform(site?.id || "");

  const handleUpdatePlatform = async (data: UpdateSitePlatformValues) => {
    if (!site) return;

    try {
      await toast.promise(updatePlatformMutation.mutateAsync(data), {
        loading: t("Loading"),
        success: t("Success"),
        error: t("Error"),
      });
      onClose();
    } catch (err) {
      console.error("Error updating platform:", err);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
  };

  // Reset form when site changes
  React.useEffect(() => {
    if (site) {
      form.reset({
        platform: site.platform,
      });
    }
  }, [site, form]);

  if (!site) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("Title")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("Description", { siteName: site.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 mb-4 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("CurrentPlatform")}
              </span>
              <PlatformBadge platform={site.platform} />
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdatePlatform)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      {t("NewPlatform.Label")}
                      <span className="text-destructive ml-1">
                        {t("NewPlatform.Required")}
                      </span>
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={updatePlatformMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("NewPlatform.Placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem
                            key={platform.value}
                            value={platform.value}
                          >
                            <div className="flex items-center gap-2">
                              <span>{platform.icon}</span>
                              <span>{platform.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      {t("NewPlatform.Helper")}
                    </p>
                    <FormMessage className="text-destructive text-sm font-medium" />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updatePlatformMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={updatePlatformMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updatePlatformMutation.isPending ? (
                    <>
                      <Spinner />
                      {t("Loading")}
                    </>
                  ) : (
                    t("Submit")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

