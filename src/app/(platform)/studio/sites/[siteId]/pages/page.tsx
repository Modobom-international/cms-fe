"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { useCreatePage, useDeletePage, useGetPages } from "@/hooks/pages";
import { useGetSiteById } from "@/hooks/sites";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const params = useParams();
  const [newPage, setNewPage] = useState({ name: "", slug: "" });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const createPageMutation = useCreatePage();
  const [open, setOpen] = useState(false);

  // Function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  // Handle name change and auto-generate slug if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNewPage((prev) => ({
      name: newName,
      slug: isSlugManuallyEdited ? prev.slug : generateSlug(newName),
    }));
  };

  // Handle manual slug change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setNewPage((prev) => ({
      ...prev,
      slug: e.target.value.toLowerCase(),
    }));
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.name.trim() || !newPage.slug.trim()) return;

    try {
      await toast.promise(
        createPageMutation.mutateAsync({
          name: newPage.name,
          slug: newPage.slug,
          site_id: params.siteId?.toString() || "",
          content: JSON.stringify({}),
        }),
        {
          loading: "Creating page...",
          success: "Page created successfully!",
          error: "Failed to create page",
        }
      );
      setNewPage({ name: "", slug: "" });
      setIsSlugManuallyEdited(false);
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
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Add a new page to your site. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePage} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Page Name
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="name"
                value={newPage.name}
                onChange={handleNameChange}
                placeholder="e.g. Home Page, About Us, Contact"
                className="w-full"
              />
              <p className="text-muted-foreground text-xs">
                This is the display name for your page
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">
                Page URL Slug
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="slug"
                value={newPage.slug}
                onChange={handleSlugChange}
                placeholder="e.g. home, about, contact"
                className="w-full font-mono text-sm"
              />
              <p className="text-muted-foreground text-xs">
                This will be used in the URL: https://{site}/
                <span className="text-foreground font-medium">
                  {newPage.slug || "page-slug"}
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createPageMutation.isPending ||
                !newPage.name.trim() ||
                !newPage.slug.trim()
              }
            >
              {createPageMutation.isPending ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create Page"
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
  const [confirmationText, setConfirmationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>Delete Page</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the page
            <span className="font-semibold"> {pageName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              To confirm, type{" "}
              <span className="text-destructive font-mono font-medium">
                {pageName}
              </span>{" "}
              below:
            </p>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type page slug to confirm"
              className="w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
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
                Deleting...
              </>
            ) : (
              "Delete Page"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Page {
  id: number;
  name: string;
  slug: string;
  updated_at: string;
  site_id: number;
}

export default function PagesManagementPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const { data: site } = useGetSiteById(siteId);
  const { data: pagesData, isLoading } = useGetPages(siteId);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    pageId: number | null;
    pageName: string;
  }>({
    isOpen: false,
    pageId: null,
    pageName: "",
  });

  const deleteMutation = useDeletePage();

  const handleDeleteClick = (pageId: number, pageName: string) => {
    setDeleteDialog({
      isOpen: true,
      pageId,
      pageName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.pageId) return;

    try {
      await deleteMutation.mutateAsync(deleteDialog.pageId);

      toast.success("Page deleted successfully", {
        description: `Deleted page: ${deleteDialog.pageName}`,
      });

      setDeleteDialog({ isOpen: false, pageId: null, pageName: "" });
    } catch (err) {
      console.error("Error deleting page:", err);
      toast.error("Failed to delete page", {
        description: "There was an error deleting the page. Please try again.",
      });
    }
  };

  return (
    <div className="container space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/studio/sites"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-2",
              })}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sites
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pages - {site?.data.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and manage pages for your site
          </p>
        </div>
        <CreatePageDialog site={site?.data.domain} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Pages</CardTitle>
          <CardDescription>A list of all pages in this site</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">
              Loading pages...
            </div>
          ) : !pagesData?.data || pagesData.data.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No pages found. Create your first page using the button above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[250px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagesData.data.map((page: Page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.name}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>
                      {new Date(page.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          href={`/editor/${siteId}/${page.slug}?pageId=${page.id}`}
                          className={buttonVariants({ size: "sm" })}
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/preview/${page.slug}`}
                          target="_blank"
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Preview
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(page.id, page.slug)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, pageId: null, pageName: "" })
        }
        onConfirm={handleDeleteConfirm}
        pageName={deleteDialog.pageName}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
