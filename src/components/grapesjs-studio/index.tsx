"use client";

import React, { useState } from "react";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

import apiClient from "@/lib/api/client";

import { useDeployPage, useExportPage, useUpdatePage } from "@/hooks/pages";

import { deleteAssets, loadAssets, uploadAssets } from "./actions/upload";

interface WebBuilderStudioProps {
  slug: string;
  siteId: string;
}

export default function WebBuilderStudio({
  slug,
  siteId,
}: WebBuilderStudioProps) {
  const [saveStatus, setSaveStatus] = useState<{
    message: string;
    type: "success" | "error" | "info" | null;
  }>({ message: "", type: null });

  // React Query hooks
  const updatePageMutation = useUpdatePage();
  const exportPageMutation = useExportPage();
  const deployPageMutation = useDeployPage();

  const saveToAPI = async (project: any) => {
    try {
      setSaveStatus({ message: "Saving...", type: "info" });

      await updatePageMutation.mutateAsync({
        slug: slug,
        content: JSON.stringify(project),
      });

      setSaveStatus({ message: "Page saved successfully!", type: "success" });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save project";
      setSaveStatus({
        message: `Error saving page: ${errorMessage}`,
        type: "error",
      });
      throw new Error(errorMessage);
    }
  };

  const loadFromAPI = async () => {
    try {
      const response = await apiClient.get(`/api/page/${slug}`);

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = response.data.data;
      const content = JSON.parse(data.content);
      console.log(`Loaded content for slug: ${slug}`, content);
      return content;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load project";

      console.warn(`Could not load content for slug: ${slug}`, errorMessage);
      throw new Error(errorMessage);
    }
  };

  const exportHTMLWithCSS = async (editor: any) => {
    try {
      setSaveStatus({ message: "Exporting HTML...", type: "info" });

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${editor.getCss()}
  </style>
</head>
<body>
  ${editor.getHtml()}
</body>
</html>`;

      // Create a Blob containing the HTML content
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("html_file", htmlBlob, "page.html");
      formData.append("slug", slug);
      formData.append("site_id", siteId);

      await exportPageMutation.mutateAsync(formData);

      setSaveStatus({
        message: "HTML exported successfully!",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);
    } catch (error) {
      console.error(`Failed to export HTML for slug: ${slug}`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to export HTML";
      setSaveStatus({
        message: `Export error: ${errorMessage}`,
        type: "error",
      });
      throw new Error("Failed to export HTML");
    }
  };

  // Plugin to add export and deploy buttons using GrapeJS Panel API
  const customButtonsPlugin = (editor: any) => {
    // Add custom styles for the buttons
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-btn {
        display: block;
        color: white;
        text-align: center;
        padding: 8px 16px;
        margin: 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
        z-index: 999;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .export-btn {
        background-color: #2563eb;
      }
      .export-btn:hover {
        background-color: #1d4ed8;
      }
      .deploy-btn {
        background-color: #16a34a;
      }
      .deploy-btn:hover {
        background-color: #15803d;
      }
      .deploy-btn.loading, .export-btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);

    // Register export command
    editor.Commands.add("export-html", {
      run: () => exportHTMLWithCSS(editor),
    });

    // Register deploy command
    editor.Commands.add("deploy-page", {
      run: async () => {
        try {
          setSaveStatus({ message: "Deploying page...", type: "info" });
          await deployPageMutation.mutateAsync({
            site_id: Number(siteId),
          });
          setSaveStatus({ message: "Deployment successful!", type: "success" });
          setTimeout(() => {
            setSaveStatus({ message: "", type: null });
          }, 3000);
        } catch (error) {
          console.error("Deploy failed:", error);
          setSaveStatus({
            message: "Deploy failed. Please try again.",
            type: "error",
          });
        }
      },
    });

    // Add a panel with the export and deploy buttons
    editor.Panels.addPanel({
      id: "custom-panel",
      visible: true,
      buttons: [
        {
          id: "export-btn",
          label: exportPageMutation.isPending
            ? "Exporting..."
            : `Export ${slug}`,
          command: "export-html",
          className: `custom-btn export-btn ${exportPageMutation.isPending ? "loading" : ""}`,
          attributes: { disabled: exportPageMutation.isPending },
        },
        {
          id: "deploy-btn",
          label: deployPageMutation.isPending
            ? "Deploying..."
            : `Deploy ${slug}`,
          command: "deploy-page",
          className: `custom-btn deploy-btn ${deployPageMutation.isPending ? "loading" : ""}`,
          attributes: { disabled: deployPageMutation.isPending },
        },
      ],
    });
  };

  return (
    <div className="relative h-screen w-screen">
      {/* Status notification */}
      {saveStatus.type && (
        <div
          className={`fixed top-4 right-4 z-[9999] rounded px-4 py-2 shadow-md ${
            saveStatus.type === "success"
              ? "bg-green-500"
              : saveStatus.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
          } text-white`}
        >
          {(updatePageMutation.isPending ||
            exportPageMutation.isPending ||
            deployPageMutation.isPending) && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          )}
          {saveStatus.message}
        </div>
      )}

      <StudioEditor
        options={{
          licenseKey: env.NEXT_PUBLIC_BACKEND_URL,
          storage: {
            type: "self",
            autosaveChanges: 5,
            onSave: async ({ project, editor }) => {
              try {
                await saveToAPI(project);
                console.log(`Project saved for slug: ${slug}`, { project });
              } catch (error) {
                console.error(
                  `Failed to save project for slug: ${slug}`,
                  error
                );
              }
            },
            onLoad: async ({ editor }) => {
              try {
                const project = await loadFromAPI();
                console.log(`Project loaded for slug: ${slug}`, { project });

                if (!project) {
                  return {
                    project: {
                      pages: [
                        {
                          name: slug,
                          component: `
                            <div style="padding: 20px; text-align: center;">
                              <h1>New Page: ${slug}</h1>
                              <p style="color: #666;">Start building your page here.</p>
                            </div>
                          `,
                        },
                      ],
                    },
                  };
                }

                return { project };
              } catch (error) {
                console.error(
                  `Failed to load project for slug: ${slug}`,
                  error
                );
                return {
                  project: {
                    pages: [
                      {
                        name: slug,
                        component: `
                          <div style="padding: 20px; text-align: center;">
                            <h1>Error Loading Page: ${slug}</h1>
                            <p style="color: #666;">Error: ${error instanceof Error ? error.message : "Unknown error"}</p>
                            <p style="color: #666;">You can start editing this page, but your changes may not be saved correctly until the issue is resolved.</p>
                          </div>
                        `,
                      },
                    ],
                  },
                };
              }
            },
          },
          project: {
            type: "web",
            default: {
              pages: [
                {
                  name: slug,
                  component: `
                    <div style="padding: 20px; text-align: center;">
                      <h1>New Page: ${slug}</h1>
                      <p style="color: #666;">Start building your page here.</p>
                    </div>
                  `,
                },
              ],
            },
          },
          plugins: [customButtonsPlugin],
          assets: {
            storageType: "self",
            onUpload: async ({ files, editor }) => {
              try {
                setSaveStatus({ message: "Uploading assets...", type: "info" });
                const uploadedAssets = await uploadAssets({ files, editor });
                setSaveStatus({
                  message: "Assets uploaded successfully!",
                  type: "success",
                });
                setTimeout(() => {
                  setSaveStatus({ message: "", type: null });
                }, 3000);
                return uploadedAssets;
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Failed to upload assets";
                setSaveStatus({
                  message: `Error uploading assets: ${errorMessage}`,
                  type: "error",
                });
                throw error;
              }
            },
            onDelete: async ({ assets, editor }) => {
              try {
                setSaveStatus({ message: "Deleting assets...", type: "info" });
                await deleteAssets({ assets, editor });
                setSaveStatus({
                  message: "Assets deleted successfully!",
                  type: "success",
                });
                setTimeout(() => {
                  setSaveStatus({ message: "", type: null });
                }, 3000);
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Failed to delete assets";
                setSaveStatus({
                  message: `Error deleting assets: ${errorMessage}`,
                  type: "error",
                });
                throw error;
              }
            },
            onLoad: async ({ editor }) => {
              try {
                return await loadAssets({ editor });
              } catch (error) {
                console.error("Error loading assets from Firebase:", error);
                return [];
              }
            },
          },
        }}
      />
    </div>
  );
}
