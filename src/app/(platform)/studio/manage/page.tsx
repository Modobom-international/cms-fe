"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Page {
  id: number;
  name: string;
  slug: string;
  updated_at: string;
}

export default function ManagePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [deployLoading, setDeployLoading] = useState<number | null>(null);
  const router = useRouter();

  // Handle deployment
  const handleDeploy = async (pageId: number, slug: string) => {
    try {
      setDeployLoading(pageId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cloudflare/deploy-exports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            project_name: "test1234",
            directory: `${slug}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Deploy failed: ${response.status}`);
      }

      // Show success message or handle response as needed
      alert("Deployment successful!");
    } catch (err) {
      console.error("Failed to deploy:", err);
      setError("Failed to deploy. Please try again later.");
    } finally {
      setDeployLoading(null);
    }
  };

  // Load all pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pages`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setPages(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load pages:", err);
        setError("Failed to load pages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Handle creating a new page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPageSlug.trim()) {
      setError("Page slug cannot be empty");
      return;
    }

    try {
      // Create a simple project structure for the new page
      const defaultProject = {
        pages: [
          {
            name: newPageSlug,
            component: `<h1>New page: ${newPageSlug}</h1><p>Start building your page here.</p>`,
          },
        ],
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-page`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            site_id: 1,
            name: newPageSlug,
            slug: newPageSlug,
            content: JSON.stringify(defaultProject),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Redirect to the new page editor
      router.push(`/studio/${newPageSlug}`);
    } catch (err) {
      console.error("Failed to create page:", err);
      setError("Failed to create page. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Manage Pages</h1>

      {/* Create new page form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Create New Page</h2>
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
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
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Create Page
          </button>
        </form>
      </div>

      {/* Pages list */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Existing Pages</h2>

        {loading ? (
          <div className="py-4 text-center">Loading pages...</div>
        ) : pages.length === 0 ? (
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
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-4 py-3">{page.name}</td>
                    <td className="px-4 py-3">{page.slug}</td>
                    <td className="px-4 py-3">
                      {new Date(page.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Link
                          href={`/studio/${page.slug}`}
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
                          onClick={() => handleDeploy(page.id, page.slug)}
                          disabled={deployLoading === page.id}
                          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-green-400"
                        >
                          {deployLoading === page.id
                            ? "Deploying..."
                            : "Deploy"}
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
