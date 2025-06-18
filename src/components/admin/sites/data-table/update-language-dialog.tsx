"use client";

import { LANGUAGES } from "@/constants/languages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Site,
  UpdateSiteFormSchema,
  UpdateSiteFormValues,
} from "@/types/site.type";

import { useUpdateSite } from "@/hooks/sites";

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

interface UpdateLanguageDialogProps {
  site: Site;
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateLanguageDialog({
  site,
  isOpen,
  onClose,
}: UpdateLanguageDialogProps) {
  const t = useTranslations("Studio.Sites");
  const updateSiteMutation = useUpdateSite(site.id);

  const form = useForm<UpdateSiteFormValues>({
    resolver: zodResolver(UpdateSiteFormSchema(t)),
    defaultValues: {
      language: site.language,
    },
  });

  const handleSubmit = async (data: UpdateSiteFormValues) => {
    try {
      await toast.promise(updateSiteMutation.mutateAsync(data), {
        loading: t("UpdateLanguage.Loading"),
        success: t("UpdateLanguage.Success"),
        error: t("UpdateLanguage.Error"),
      });
      onClose();
    } catch (err) {
      console.error("Error updating site language:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t("UpdateLanguage.Title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t("UpdateLanguage.Description", { siteName: site.name })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-foreground">
                    {t("UpdateLanguage.Label")}
                    <span className="text-destructive ml-1">
                      {t("UpdateLanguage.Required")}
                    </span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={updateSiteMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("UpdateLanguage.Placeholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-destructive text-sm font-medium" />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                {t("UpdateLanguage.Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateSiteMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateSiteMutation.isPending ? (
                  <>
                    <Spinner />
                    {t("UpdateLanguage.Saving")}
                  </>
                ) : (
                  t("UpdateLanguage.Save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
