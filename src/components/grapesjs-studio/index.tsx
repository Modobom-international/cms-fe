"use client";

import React from "react";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { toast } from "sonner";

import apiClient from "@/lib/api/client";

import { useDeployPage, useExportPage, useUpdatePage } from "@/hooks/pages";

import { deleteAssets, loadAssets, uploadAssets } from "./actions/upload";
import { buttonBlock } from "./blocks/button";

interface WebBuilderStudioProps {
  slug: string;
  siteId: string;
  pageId: string;
}

export default function WebBuilderStudio({
  slug,
  siteId,
  pageId,
}: WebBuilderStudioProps) {
  // React Query hooks
  const updatePageMutation = useUpdatePage();
  const exportPageMutation = useExportPage(pageId);
  const deployPageMutation = useDeployPage();

  const saveToAPI = async (project: any) => {
    try {
      toast.promise(
        updatePageMutation.mutateAsync({
          pageId: pageId,
          content: JSON.stringify(project),
        }),
        {
          loading: "Saving page...",
          success: "Page saved successfully!",
          error: "Failed to save page",
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save project";
      toast.error("Failed to save page", {
        description: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const loadFromAPI = async () => {
    try {
      const response = await apiClient.get(`/api/page/${pageId}`);

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = response.data.data;
      const content = JSON.parse(data.content);
      console.log(`Loaded content for page ID: ${pageId}`, content);
      return content;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load project";

      console.warn(
        `Could not load content for page ID: ${pageId}`,
        errorMessage
      );
      throw new Error(errorMessage);
    }
  };

  const exportHTMLWithCSS = async (editor: any) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://api.modobomco.com/js/users-tracking.min.js" async></script>
  <style>
    ${editor.getCss()}
  </style>
</head>
<body>
  ${editor.getHtml()}
</body>
</html>`;

    const htmlBlob = new Blob([htmlContent], { type: "text/html" });
    const formData = new FormData();
    formData.append("html_file", htmlBlob, "page.html");
    formData.append("page_id", pageId);
    formData.append("site_id", siteId);

    return toast.promise(exportPageMutation.mutateAsync(formData), {
      loading: "Exporting HTML...",
      success: "HTML exported successfully!",
      error: (err) =>
        `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
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
      run: () => {
        return toast.promise(
          deployPageMutation.mutateAsync({
            site_id: Number(siteId),
          }),
          {
            loading: "Deploying page...",
            success: "Deployment successful!",
            error: (err) =>
              `Deploy failed: ${err instanceof Error ? err.message : "Please try again"}`,
          }
        );
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
                const uploadedAssets = await uploadAssets({ files, editor });
                toast.success("Assets uploaded successfully!");
                return uploadedAssets;
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Failed to upload assets";
                toast.error("Failed to upload assets", {
                  description: errorMessage,
                });
                throw error;
              }
            },
            onDelete: async ({ assets, editor }) => {
              try {
                toast.loading("Deleting assets...");
                await deleteAssets({ assets, editor });
                toast.success("Assets deleted successfully!");
              } catch (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : "Failed to delete assets";
                toast.error("Failed to delete assets", {
                  description: errorMessage,
                });
                throw error;
              }
            },
            onLoad: async ({ editor }) => {
              try {
                return await loadAssets({ editor });
              } catch (error) {
                console.error("Error loading assets:", error);
                toast.error("Failed to load assets", {
                  description: "Please try again later",
                });
                return [];
              }
            },
          },
        }}
        onEditor={(editor) => {
          customButtonsPlugin(editor);
          buttonBlock(editor); // Register the button block
        }}
      />
    </div>
  );
}
