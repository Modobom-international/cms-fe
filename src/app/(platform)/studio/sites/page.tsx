"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateSite,
  useDeleteSite,
  useGetSites,
  useUpdateSite,
} from "@/hooks/sites";

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

interface Site {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
  isDeleting: boolean;
}

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isDeleting,
}: DeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Site</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the site
            <span className="font-semibold"> {siteName}</span> and all its
            pages.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2 text-sm text-gray-600">
            To confirm, type{" "}
            <span className="font-mono text-red-500">{siteName}</span> below:
          </p>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type site name to confirm"
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
            disabled={confirmationText !== siteName || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateSiteDialog() {
  const [newSite, setNewSite] = useState({ name: "", domain: "" });
  const createSiteMutation = useCreateSite();
  const [open, setOpen] = useState(false);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name.trim() || !newSite.domain.trim()) return;

    try {
      await toast.promise(createSiteMutation.mutateAsync(newSite), {
        loading: "Creating site...",
        success: "Site created successfully!",
        error: "Failed to create site",
      });
      setNewSite({ name: "", domain: "" });
      setOpen(false);
    } catch (err) {
      console.error("Error creating site:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Site</DialogTitle>
          <DialogDescription>
            Add a new site to your portfolio. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateSite}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Site Name
              </label>
              <Input
                id="name"
                value={newSite.name}
                onChange={(e) =>
                  setNewSite({ ...newSite, name: e.target.value })
                }
                placeholder="My Awesome Site"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="domain" className="text-sm font-medium">
                Domain
              </label>
              <Input
                id="domain"
                value={newSite.domain}
                onChange={(e) =>
                  setNewSite({ ...newSite, domain: e.target.value })
                }
                placeholder="example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createSiteMutation.isPending}>
              {createSiteMutation.isPending ? "Creating..." : "Create Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SitesManagementPage() {
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    siteId: string | null;
    siteName: string;
  }>({
    isOpen: false,
    siteId: null,
    siteName: "",
  });

  const { data: sitesData, isLoading } = useGetSites();
  const updateSiteMutation = useUpdateSite(editingSite?.id || "");
  const deleteSiteMutation = useDeleteSite();

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    try {
      await toast.promise(updateSiteMutation.mutateAsync(editingSite), {
        loading: "Updating site...",
        success: "Site updated successfully!",
        error: "Failed to update site",
      });
      setEditingSite(null);
    } catch (err) {
      console.error("Error updating site:", err);
    }
  };

  const handleDeleteClick = (siteId: string, siteName: string) => {
    setDeleteDialog({
      isOpen: true,
      siteId,
      siteName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.siteId) return;

    try {
      await toast.promise(deleteSiteMutation.mutateAsync(deleteDialog.siteId), {
        loading: "Deleting site...",
        success: `Site "${deleteDialog.siteName}" deleted successfully`,
        error: "Failed to delete site",
      });
      setDeleteDialog({ isOpen: false, siteId: null, siteName: "" });
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  return (
    <div className="container space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sites Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and manage your sites and their pages
          </p>
        </div>
        <CreateSiteDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Sites</CardTitle>
          <CardDescription>
            A list of all your sites and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-center">
              Loading sites...
            </div>
          ) : !sitesData?.data || sitesData.data.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No sites found. Create your first site using the button above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sitesData.data.map((site: Site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>{site.domain}</TableCell>
                    <TableCell>
                      {new Date(site.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          href={`/studio/sites/${site.id}/pages`}
                          className={buttonVariants({
                            variant: "default",
                            size: "sm",
                          })}
                        >
                          Pages
                        </Link>
                        {editingSite?.id === site.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateSite}
                              disabled={updateSiteMutation.isPending}
                            >
                              {updateSiteMutation.isPending
                                ? "Saving..."
                                : "Save"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSite(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSite(site)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(site.id, site.name)}
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
          setDeleteDialog({ isOpen: false, siteId: null, siteName: "" })
        }
        onConfirm={handleDeleteConfirm}
        siteName={deleteDialog.siteName}
        isDeleting={deleteSiteMutation.isPending}
      />
    </div>
  );
}
