"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";

import { useCreatePage, useDeletePage, useGetPages } from "@/hooks/pages";
import { useGetSiteById } from "@/hooks/sites";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

export default function SitePagesManagement() {
  const [newPageSlug, setNewPageSlug] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    pageId: number | null;
    pageName: string;
  }>({
    isOpen: false,
    pageId: null,
    pageName: "",
  });

  const params = useParams();
  const router = useRouter();
  const siteId = Number(params.siteId);

  // React Query hooks
  const { data: siteData, isLoading: isSiteLoading } = useGetSiteById(siteId);
  const { data: pagesData, isLoading: isPagesLoading } = useGetPages(siteId);
  const createPageMutation = useCreatePage();
  const deletePageMutation = useDeletePage();

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPageSlug.trim()) return;

    try {
      const defaultProject = {
        pages: [
          {
            name: newPageSlug,
            component: `<h1>New page: ${newPageSlug}</h1><p>Start building your page here.</p>`,
          },
        ],
      };

      await createPageMutation.mutateAsync({
        site_id: siteId,
        name: newPageSlug,
        slug: newPageSlug,
        content: JSON.stringify(defaultProject),
      });

      toast.success("Page created successfully", {
        description: `Created new page: ${newPageSlug}`,
      });

      setNewPageSlug("");
    } catch (err) {
      console.error("Error creating page:", err);
      toast.error("Failed to create page", {
        description: "There was an error creating the page. Please try again.",
      });
    }
  };

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
      await deletePageMutation.mutateAsync(deleteDialog.pageId);

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

  if (isSiteLoading || isPagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!siteData?.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">Site not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/studio/sites"
            className="mb-2 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to Sites
          </Link>
          <h1 className="text-3xl font-bold">{siteData.data.name} - Pages</h1>
        </div>
      </div>

      {/* Create new page form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Create New Page</h2>
        {createPageMutation.error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {String(createPageMutation.error)}
          </div>
        )}

        <form onSubmit={handleCreatePage} className="flex gap-4">
          <div className="flex-grow">
            <label
              htmlFor="newPageSlug"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Page Slug
            </label>
            <input
              type="text"
              id="newPageSlug"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="e.g. about-us"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={createPageMutation.isPending}
            className="self-end rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-blue-400"
          >
            {createPageMutation.isPending ? "Creating..." : "Create Page"}
          </button>
        </form>
      </div>

      {/* Pages list */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Pages</h2>

        {!pagesData?.data || pagesData.data.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            No pages found. Create your first page above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Last Updated</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagesData.data.map((page: Page) => (
                  <tr key={page.id}>
                    <td className="px-4 py-3">{page.name}</td>
                    <td className="px-4 py-3">{page.slug}</td>
                    <td className="px-4 py-3">
                      {new Date(page.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Link
                          href={`/studio/sites/${siteId}/pages/${page.slug}?pageId=${page.id}`}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/preview/${page.slug}`}
                          target="_blank"
                          className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                        >
                          Preview
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(page.id, page.slug)}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, pageId: null, pageName: "" })
        }
        onConfirm={handleDeleteConfirm}
        pageName={deleteDialog.pageName}
        isDeleting={deletePageMutation.isPending}
      />
    </div>
  );
}
