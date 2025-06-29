"use client";

import { useState } from "react";

import { useParams } from "next/navigation";

import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreatePage } from "@/hooks/pages";

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
import { Label } from "@/components/ui/label";

import { Spinner } from "@/components/global/spinner";

interface CreatePageDialogProps {
  site: string;
}

export default function CreatePageDialog({ site }: CreatePageDialogProps) {
  const t = useTranslations("Studio.Sites.Pages");
  const params = useParams();
  const [newPage, setNewPage] = useState({ name: "", slug: "" });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const createPageMutation = useCreatePage();
  const [open, setOpen] = useState(false);

  // Function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Function to validate slug format
  const validateSlug = (slug: string) => {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug);
  };

  // Function to check slug validation and set error message
  const checkSlugValidation = (slug: string) => {
    if (!slug.trim()) {
      setSlugError(t("Create.Form.Slug.Validation.Required"));
      return false;
    }
    if (!validateSlug(slug)) {
      setSlugError(t("Create.Form.Slug.Validation.Invalid"));
      return false;
    }
    if (slug.length < 3) {
      setSlugError(t("Create.Form.Slug.Validation.MinLength"));
      return false;
    }
    if (slug.length > 64) {
      setSlugError(t("Create.Form.Slug.Validation.MaxLength"));
      return false;
    }
    setSlugError(null);
    return true;
  };

  // Handle name change and auto-generate slug if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const newSlug = isSlugManuallyEdited ? newPage.slug : generateSlug(newName);
    setNewPage(() => ({
      name: newName,
      slug: newSlug,
    }));
    checkSlugValidation(newSlug);
  };

  // Handle manual slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    const newSlug = e.target.value.toLowerCase();
    setNewPage((prev) => ({
      ...prev,
      slug: newSlug,
    }));
    checkSlugValidation(newSlug);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkSlugValidation(newPage.slug)) {
      return;
    }

    try {
      await toast.promise(
        createPageMutation.mutateAsync({
          name: newPage.name,
          slug: newPage.slug,
          site_id: params.siteId?.toString() || "",
          content: JSON.stringify({}),
        }),
        {
          loading: t("Create.Toast.Loading"),
          success: t("Create.Toast.Success"),
          error: t("Create.Toast.Error"),
        }
      );
      setNewPage({ name: "", slug: "" });
      setIsSlugManuallyEdited(false);
      setSlugError(null);
      setOpen(false);
    } catch (err) {
      console.error("Error creating page:", err);
    }
  };

  // Reset states when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewPage({ name: "", slug: "" });
      setIsSlugManuallyEdited(false);
      setSlugError(null);
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2">
          <PlusIcon className="h-4 w-4" />
          {t("Create.Button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>{t("Create.Dialog.Title")}</DialogTitle>
          <DialogDescription>
            {t("Create.Dialog.Description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePage} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("Create.Form.Name.Label")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="name"
                value={newPage.name}
                onChange={handleNameChange}
                placeholder={t("Create.Form.Name.Placeholder")}
                className="w-full"
              />
              <p className="text-muted-foreground text-xs">
                {t("Create.Form.Name.Help")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">
                {t("Create.Form.Slug.Label")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="slug"
                value={newPage.slug}
                onChange={handleSlugChange}
                placeholder={t("Create.Form.Slug.Placeholder")}
                className="w-full font-mono text-sm"
              />
              <p className="text-muted-foreground text-xs">
                {t("Create.Form.Slug.Help", { site })}
                <span className="text-foreground font-medium">
                  {newPage.slug || "page-slug"}
                </span>
              </p>
              {slugError && (
                <p className="text-destructive text-sm">{slugError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("Create.Form.Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createPageMutation.isPending || !!slugError}
            >
              {createPageMutation.isPending ? (
                <>
                  <Spinner />
                  {t("Create.Form.Submitting")}
                </>
              ) : (
                t("Create.Form.Submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
