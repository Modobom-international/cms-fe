"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useCreateSite,
  useDeleteSite,
  useGetSites,
  useUpdateSite,
} from "@/hooks/sites";

interface Site {
  id: number;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

export default function SitesManagementPage() {
  const [newSite, setNewSite] = useState({ name: "", domain: "" });
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const router = useRouter();

  // React Query hooks
  const { data: sitesData, isLoading } = useGetSites();
  const createSiteMutation = useCreateSite();
  const updateSiteMutation = useUpdateSite(editingSite?.id || 0);
  const deleteSiteMutation = useDeleteSite();

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name.trim() || !newSite.domain.trim()) return;

    try {
      await createSiteMutation.mutateAsync(newSite);
      setNewSite({ name: "", domain: "" });
    } catch (err) {
      console.error("Error creating site:", err);
    }
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    try {
      await updateSiteMutation.mutateAsync(editingSite);
      setEditingSite(null);
    } catch (err) {
      console.error("Error updating site:", err);
    }
  };

  const handleDeleteSite = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this site?")) return;

    try {
      await deleteSiteMutation.mutateAsync(id);
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sites Management</h1>
      </div>

      {/* Create new site form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Create New Site</h2>
        {(createSiteMutation.error ||
          updateSiteMutation.error ||
          deleteSiteMutation.error) && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {String(
              createSiteMutation.error ||
                updateSiteMutation.error ||
                deleteSiteMutation.error
            )}
          </div>
        )}

        <form onSubmit={handleCreateSite} className="space-y-4">
          <div>
            <label
              htmlFor="siteName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Site Name
            </label>
            <input
              type="text"
              id="siteName"
              value={newSite.name}
              onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              placeholder="My Awesome Site"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="siteDomain"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Domain
            </label>
            <input
              type="text"
              id="siteDomain"
              value={newSite.domain}
              onChange={(e) =>
                setNewSite({ ...newSite, domain: e.target.value })
              }
              placeholder="example.com"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={createSiteMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-blue-400"
          >
            {createSiteMutation.isPending ? "Creating..." : "Create Site"}
          </button>
        </form>
      </div>

      {/* Sites list */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Your Sites</h2>

        {isLoading ? (
          <div className="py-4 text-center">Loading sites...</div>
        ) : !sitesData?.data || sitesData.data.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            No sites found. Create your first site above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sitesData.data.map((site: Site) => (
                  <tr key={site.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSite?.id === site.id ? (
                        <input
                          type="text"
                          value={editingSite.name}
                          onChange={(e) =>
                            setEditingSite({
                              ...editingSite,
                              name: e.target.value,
                            })
                          }
                          className="rounded border px-2 py-1"
                          aria-label="Edit site name"
                          placeholder="Site name"
                        />
                      ) : (
                        site.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSite?.id === site.id ? (
                        <input
                          type="text"
                          value={editingSite.domain}
                          onChange={(e) =>
                            setEditingSite({
                              ...editingSite,
                              domain: e.target.value,
                            })
                          }
                          className="rounded border px-2 py-1"
                          aria-label="Edit site domain"
                          placeholder="Site domain"
                        />
                      ) : (
                        site.domain
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(site.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/studio/sites/${site.id}/pages`}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          Pages
                        </Link>
                        {editingSite?.id === site.id ? (
                          <>
                            <button
                              onClick={handleUpdateSite}
                              disabled={updateSiteMutation.isPending}
                              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-green-400"
                            >
                              {updateSiteMutation.isPending
                                ? "Saving..."
                                : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingSite(null)}
                              className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingSite(site)}
                            className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSite(site.id)}
                          disabled={deleteSiteMutation.isPending}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:bg-red-400"
                        >
                          {deleteSiteMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
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
    </div>
  );
}
