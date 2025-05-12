"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Editor from "@monaco-editor/react";
import { ArrowLeft, ChevronRight, Home, PlusIcon, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  useCreatePage,
  useDeletePage,
  useDeleteTrackingScript,
  useGetPages,
  useGetTrackingScript,
  useUpdateTrackingScript,
} from "@/hooks/pages";
import { useGetSiteById } from "@/hooks/sites";
import { useDebounce } from "@/hooks/use-debounce";

import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Spinner } from "@/components/global/spinner";

function CreatePageDialog({ site }: { site: string }) {
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
    setNewPage((prev) => ({
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

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pageName: string;
  isDeleting: boolean;
}

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  pageName,
  isDeleting,
}: DeleteDialogProps) {
  const t = useTranslations("Studio.Sites.Pages");
  const [confirmationText, setConfirmationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>{t("Delete.Dialog.Title")}</DialogTitle>
          <DialogDescription>
            {t("Delete.Dialog.Description")}
            <span className="font-semibold"> {pageName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("Delete.Dialog.ConfirmationText")}{" "}
              <span className="text-destructive font-mono font-medium">
                {pageName}
              </span>{" "}
              {t("Delete.Dialog.ConfirmationText2")}
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t("Delete.Dialog.InputPlaceholder")}
              className="w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 space-x-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("Delete.Dialog.Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmationText !== pageName || isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Spinner />
                {t("Delete.Dialog.Deleting")}
              </>
            ) : (
              t("Delete.Dialog.Confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Page {
  id: string;
  name: string;
  slug: string;
  updated_at: string;
}

interface Site {
  id: string;
  name: string;
  domain: string;
}

function TrackingScriptDialog({
  pageId,
  pageName,
}: {
  pageId: string;
  pageName: string;
}) {
  const t = useTranslations("Studio.Sites.Pages");
  const [open, setOpen] = useState(false);
  const [trackingScript, setTrackingScript] = useState("");
  const { data: trackingScriptData } = useGetTrackingScript(pageId);
  const updateTrackingScript = useUpdateTrackingScript();
  const deleteTrackingScript = useDeleteTrackingScript();

  useEffect(() => {
    if (trackingScriptData?.data?.tracking_script) {
      setTrackingScript(trackingScriptData.data.tracking_script);
    }
  }, [trackingScriptData]);

  const handleSave = async () => {
    try {
      await toast.promise(
        updateTrackingScript.mutateAsync({
          pageId,
          data: { tracking_script: trackingScript },
        }),
        {
          loading: t("TrackingScript.Toast.Loading"),
          success: t("TrackingScript.Toast.Success"),
          error: t("TrackingScript.Toast.Error"),
        }
      );
      setOpen(false);
    } catch (err) {
      console.error("Error updating tracking script:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await toast.promise(deleteTrackingScript.mutateAsync(pageId), {
        loading: t("TrackingScript.Delete.Toast.Loading"),
        success: t("TrackingScript.Delete.Toast.Success"),
        error: t("TrackingScript.Delete.Toast.Error"),
      });
      setTrackingScript("");
      setOpen(false);
    } catch (err) {
      console.error("Error deleting tracking script:", err);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setTrackingScript(value || "");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          {t("List.Table.TrackingScript")}
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {t("TrackingScript.Dialog.Title", { pageName })}
          </DialogTitle>
          <DialogDescription>
            {t("TrackingScript.Dialog.Description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tracking-script">
              {t("TrackingScript.Dialog.Label")}
            </Label>
            <div className="overflow-hidden rounded-md border">
              <Editor
                height="300px"
                defaultLanguage="html"
                value={trackingScript}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {t("TrackingScript.Dialog.Help")}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 space-x-2 sm:gap-0">
          {trackingScript && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTrackingScript.isPending}
              className="w-full sm:w-auto"
            >
              {deleteTrackingScript.isPending ? (
                <>
                  <Spinner />
                  {t("TrackingScript.Delete.Dialog.Deleting")}
                </>
              ) : (
                t("TrackingScript.Delete.Dialog.Confirm")
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            {t("TrackingScript.Dialog.Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTrackingScript.isPending}
            className="w-full sm:w-auto"
          >
            {updateTrackingScript.isPending ? (
              <>
                <Spinner />
                {t("TrackingScript.Dialog.Saving")}
              </>
            ) : (
              t("TrackingScript.Dialog.Save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PagesPage() {
  const t = useTranslations("Studio.Sites.Pages");
  const params = useParams();
  const router = useRouter();
  const { data: siteData } = useGetSiteById(params.siteId?.toString() || "");
  const { data: pagesData, isLoading } = useGetPages(
    params.siteId?.toString() || ""
  );
  const deletePageMutation = useDeletePage();

  const site = siteData?.data as Site | undefined;
  const pages = pagesData?.data as Page[] | undefined;

  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    pageId: string;
    pageName: string;
  }>({
    isOpen: false,
    pageId: "",
    pageName: "",
  });

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!pages) return [];
    if (!debouncedSearch) return pages;

    const searchLower = debouncedSearch.toLowerCase();
    return pages.filter(
      (page) =>
        page.name.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower)
    );
  }, [pages, debouncedSearch]);

  const handleDeletePage = async () => {
    try {
      await toast.promise(
        deletePageMutation.mutateAsync({
          pageId: parseInt(deleteDialogState.pageId),
          siteId: params.siteId?.toString() || "",
        }),
        {
          loading: t("Delete.Toast.Loading"),
          success: t("Delete.Toast.Success"),
          error: t("Delete.Toast.Error"),
        }
      );
      setDeleteDialogState({ isOpen: false, pageId: "", pageName: "" });
    } catch (err) {
      console.error("Error deleting page:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <Link href="/studio/sites" className="hover:text-foreground">
            {t("Breadcrumb")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{site?.name || ""}</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("Title", { siteName: site?.domain || "" })}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("Description", { siteName: site?.name || "" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreatePageDialog site={site?.domain || ""} />
          </div>
        </div>
      </div>

      <div className="pt-6">
        {/* Add Search Bar */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder={t("List.Search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Table content */}
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-center">
            <Spinner />
            <p className="mt-2">{t("List.Loading")}</p>
          </div>
        ) : !filteredPages || filteredPages.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            {debouncedSearch ? t("List.NoSearchResults") : t("List.NoPages")}
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-white">
                  <TableHead className="w-[250px] py-3 font-medium text-gray-700">
                    {t("List.Table.Name")}
                  </TableHead>
                  <TableHead className="w-[200px] py-3 font-medium text-gray-700">
                    {t("List.Table.Slug")}
                  </TableHead>
                  <TableHead className="w-[150px] py-3 font-medium text-gray-700">
                    {t("List.Table.LastUpdated")}
                  </TableHead>
                  <TableHead className="w-[300px] py-3 text-right font-medium text-gray-700">
                    {t("List.Table.Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page: Page) => (
                  <TableRow
                    key={page.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="py-3 text-sm font-medium">
                      {page.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 font-mono text-sm">
                      {page.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-sm">
                      {new Date(page.updated_at || "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/editor/${params.siteId}/${page.slug}?pageId=${page.id}`
                            )
                          }
                        >
                          {t("List.Table.Edit")}
                        </Button>
                        <TrackingScriptDialog
                          pageId={page.id}
                          pageName={page.name}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            setDeleteDialogState({
                              isOpen: true,
                              pageId: page.id,
                              pageName: page.name,
                            })
                          }
                        >
                          {t("List.Table.Delete")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() =>
                            window.open(
                              `https://${site?.domain}/${page.slug}`,
                              "_blank"
                            )
                          }
                        >
                          {t("List.Table.View")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() =>
          setDeleteDialogState({ isOpen: false, pageId: "", pageName: "" })
        }
        onConfirm={handleDeletePage}
        pageName={deleteDialogState.pageName}
        isDeleting={deletePageMutation.isPending}
      />
    </div>
  );
}

