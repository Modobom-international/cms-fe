"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { toast } from "sonner";

import apiClient from "@/lib/api/client";

import { useDeployPage, useExportPage, useUpdatePage } from "@/hooks/pages";

import { deleteAssets, loadAssets, uploadAssets } from "./actions/upload";
import { buttonBlock } from "./blocks/button";
import { getTranslations } from "next-intl/server";

interface WebBuilderStudioProps {
  slug: string;
  siteId: string;
  pageId: string;
}

export default  function WebBuilderStudio({
  slug,
  siteId,
  pageId,
}: WebBuilderStudioProps) {
  const t = useTranslations("Editor");
  
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
          loading: t("SavePage"),
          success: t("SaveSuccess"),
          error: t("SaveError"),
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("SaveError");
      toast.error(t("SaveError"), {
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
        err instanceof Error ? err.message : t("SaveError");

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

    return exportPageMutation.mutateAsync(formData);
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
      .export-deploy-btn {
        background-color: #7c3aed;
      }
      .export-deploy-btn:hover {
        background-color: #6d28d9;
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
            page_slug: slug,
          }),
          {
            loading: t("DeployPage"),
            success: t("DeploySuccess"),
            error: (err) =>
              t("DeployError", { error: err instanceof Error ? err.message : "Please try again" }),
          }
        );
      },
    });

    // Combined export and deploy command
    editor.Commands.add("export-and-deploy", {
      run: async () => {
        try {
          // First export
          await toast.promise(
            exportHTMLWithCSS(editor),
            {
              loading: t("ExportHTML"),
              success: t("ExportSuccess"),
              error: (err) =>
                t("ExportError", { error: err instanceof Error ? err.message : "Please try again" }),
            }
          );
          
          // Then deploy
          return toast.promise(
            deployPageMutation.mutateAsync({
              site_id: Number(siteId),
              page_slug: slug,
            }),
            {
              loading: t("DeployPage"),
              success: t("DeploySuccess"),
              error: (err) =>
                t("DeployError", { error: err instanceof Error ? err.message : "Please try again" }),
            }
          );
        } catch (err) {
          toast.error(t("ExportAndDeployError"), {
            description: err instanceof Error ? err.message : "Please try again",
          });
          throw err;
        }
      }
    });

    // Add a panel with the combined export and deploy button
    editor.Panels.addPanel({
      id: "custom-panel",
      visible: true,
      buttons: [
        {
          id: "export-deploy-btn",
          label: exportPageMutation.isPending || deployPageMutation.isPending
            ? exportPageMutation.isPending ? t("Exporting") : t("Deploying")
            : t("ExportAndDeployButton"),
          command: "export-and-deploy",
          className: `custom-btn export-deploy-btn ${(exportPageMutation.isPending || deployPageMutation.isPending) ? "loading" : ""}`,
          attributes: { disabled: exportPageMutation.isPending || deployPageMutation.isPending },
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
                              <h1>${t("NewPage.Title", { slug })}</h1>
                              <p style="color: #666;">${t("NewPage.Description")}</p>
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
                            <h1>${t("NewPage.Title", { slug })}</h1>
                            <p style="color: #666;">${t("NewPage.Description")}</p>
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
                      <h1>${t("NewPage.Title", { slug })}</h1>
                      <p style="color: #666;">${t("NewPage.Description")}</p>
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
