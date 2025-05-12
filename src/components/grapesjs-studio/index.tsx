"use client";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import type { Editor } from "grapesjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";


import {
  useDeployPage,
  useExportPage,
  useLoadFromAPI,
  useUpdatePage,
} from "@/hooks/pages";

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
  const t = useTranslations("Editor");

  // React Query hooks
  const updatePageMutation = useUpdatePage();
  const exportPageMutation = useExportPage(pageId);
  const deployPageMutation = useDeployPage();
  const { data: pageContent, isLoading, isError } = useLoadFromAPI(pageId);
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
      const errorMessage = err instanceof Error ? err.message : t("SaveError");
      toast.error(t("SaveError"), {
        description: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const exportHTMLWithCSS = async (editor: Editor) => {
    // Get the HTML content from editor
    const editorHTML = editor.getHtml({ cleanId: true });

    // Parse the HTML to extract the body content
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorHTML, "text/html");
    // Extract meta tags, title, and other head content if they exist
    const headContent = doc.head.innerHTML || "";
    // Get the body content by extracting only the inner content of the body tag
    const bodyContent = doc.body ? doc.body.innerHTML : editorHTML;

    // Combine everything into a proper HTML structure
    const htmlContent = `<!DOCTYPE html>
<html lang="${pageContent?.language}">
<head>
  ${headContent}
  <style>
    ${editor.getCss()}
  </style>
  <script>
    ${editor.getJs()}
  </script>
  <script>
    // Hàm kiểm tra query parameter force=1 trên URL hiện tại
    function updateDownloadLink() {
      // Lấy query string hiện tại
      const searchParams = new URLSearchParams(window.location.search);
      
      // Kiểm tra nếu có force=1
      if (searchParams.get('force') === '1') {
        const downloadLink = document.getElementById("Download");
        if (downloadLink) {
          // Kiểm tra nếu link đã có query parameter
          let href = downloadLink.href;
          if (href.includes('?')) {
            // Kiểm tra nếu force=1 chưa có trong href
            if (!href.includes("force=1")) {
              href += "&force=1";
            }
          } else {
            href += "?force=1";
          }
          downloadLink.href = href;
        }
      }
    }

    // Function to handle download clicks
    function handleDownloadClick(e) {
      if (typeof gtag_report_conversion === "function") {
        gtag_report_conversion();
      }
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Update download links
      updateDownloadLink();

      // Add click handlers to all download links
      const downloadLinks = document.querySelectorAll('.download');
      downloadLinks.forEach(link => {
        link.addEventListener('click', handleDownloadClick);
      });
    });
  </script>
</head>
<body>
  ${bodyContent}
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
              t("DeployError", {
                error: err instanceof Error ? err.message : "Please try again",
              }),
          }
        );
      },
    });

    // Combined export and deploy command
    editor.Commands.add("export-and-deploy", {
      run: async () => {
        try {
          // First export - making sure it completes fully
          const exportResult = await toast.promise(exportHTMLWithCSS(editor), {
            loading: t("ExportHTML"),
            success: t("ExportSuccess"),
            error: (err) =>
              t("ExportError", {
                error: err instanceof Error ? err.message : "Please try again",
              }),
          });

          // Wait to ensure export is fully processed
          console.log("Export completed successfully:", exportResult);

          // Then deploy after export is confirmed complete
          return toast.promise(
            deployPageMutation.mutateAsync({
              site_id: Number(siteId),
              page_slug: slug,
            }),
            {
              loading: t("DeployPage"),
              success: t("DeploySuccess"),
              error: (err) =>
                t("DeployError", {
                  error:
                    err instanceof Error ? err.message : "Please try again",
                }),
            }
          );
        } catch (err) {
          toast.error(t("ExportAndDeployError"), {
            description:
              err instanceof Error ? err.message : "Please try again",
          });
          throw err;
        }
      },
    });

    // Add a panel with the combined export and deploy button
    editor.Panels.addPanel({
      id: "custom-panel",
      visible: true,
      buttons: [
        {
          id: "export-deploy-btn",
          label:
            exportPageMutation.isPending || deployPageMutation.isPending
              ? exportPageMutation.isPending
                ? t("Exporting")
                : t("Deploying")
              : t("ExportAndDeployButton"),
          command: "export-and-deploy",
          className: `custom-btn export-deploy-btn ${exportPageMutation.isPending || deployPageMutation.isPending ? "loading" : ""}`,
          attributes: {
            disabled:
              exportPageMutation.isPending || deployPageMutation.isPending,
          },
        },
      ],
    });
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">{t("LoadingPage")}</div>
          <div className="text-muted-foreground text-sm">{t("PleaseWait")}</div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold">
            {t("LoadError")}
          </div>
          <div className="text-muted-foreground text-sm">{t("TryAgain")}</div>
        </div>
      </div>
    );
  }

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
              // Since we're already waiting for the data to load before rendering,
              // we can be confident that pageContent is available here
              if (!pageContent?.content) {
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

              return { project: pageContent.content };
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
                const uploadedAssets = await uploadAssets({
                  files,
                  editor,
                  siteId,
                  slug,
                });
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
                await deleteAssets({
                  assets,
                  editor,
                  siteId,
                });
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
                return await loadAssets({
                  editor,
                  siteId,
                });
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

