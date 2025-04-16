"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { PlusIcon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CreatePageDialog() {
  const params = useParams();
  const [newPage, setNewPage] = useState({ name: "", slug: "" });
  const createPageMutation = useCreatePage();
  const [open, setOpen] = useState(false);

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
      setOpen(false);
    } catch (err) {
      console.error("Error creating page:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Add a new page to your site. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePage}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Page Name
              </label>
              <Input
                id="name"
                value={newPage.name}
                onChange={(e) =>
                  setNewPage({ ...newPage, name: e.target.value })
                }
                placeholder="Home Page"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="slug"
                value={newPage.slug}
                onChange={(e) =>
                  setNewPage({ ...newPage, slug: e.target.value })
                }
                placeholder="home"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createPageMutation.isPending}>
              {createPageMutation.isPending ? "Creating..." : "Create Page"}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Page</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the page
            <span className="font-semibold"> {pageName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2 text-sm text-gray-600">
            To confirm, type{" "}
            <span className="font-mono text-red-500">{pageName}</span> below:
          </p>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type page slug to confirm"
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmationText !== pageName || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Page"}
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pages - {site?.data.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and manage pages for your site
          </p>
        </div>
        <CreatePageDialog />
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
                          href={`/studio/sites/${siteId}/pages/${page.slug}?pageId=${page.id}`}
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
