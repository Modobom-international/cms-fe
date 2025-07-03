"use client";

import { PLATFORMS } from "@/constants/platform";
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
import { useGetSiteById } from "@/hooks/sites";

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
  const {
    data: pageContent,
    isLoading: isPageLoading,
    isError: isPageError,
  } = useLoadFromAPI(pageId);
  const {
    data: site,
    isLoading: isSiteLoading,
    isError: isSiteError,
  } = useGetSiteById(siteId);
  // console.log(site?.data?.platform == PLATFORMS[2].value ? "true" : "false");
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
    // Ensure site data is loaded before proceeding
    if (!site?.data) {
      toast.error(t("SiteDataNotLoaded"));
      throw new Error("Site data not loaded");
    }

    // Get the HTML content from editor
    const editorHTML = editor.getHtml({ cleanId: true });

    // Parse the HTML to extract the body content
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorHTML, "text/html");
    // Extract meta tags, title, and other head content if they exist
    const headContent = doc.head.innerHTML || "";

    // Get the body content and preserve body attributes (like ID)
    let bodyContent = doc.body ? doc.body.innerHTML : editorHTML;
    let bodyAttributes = "";

    if (doc.body) {
      // Extract all attributes from the body element
      const attributes = Array.from(doc.body.attributes);
      bodyAttributes = attributes
        .map((attr) => `${attr.name}="${attr.value}"`)
        .join(" ");
    }

    const loadingOverlayScript = `
    <script>
    // Create loading overlay function
    function createLoadingOverlay() {
      // Create overlay element if it doesn't exist
      if (!document.getElementById('download-loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'download-loading-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = \`
          <div class="loading-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-svg">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p>Preparing download...</p>
          </div>
        \`;
        document.body.appendChild(overlay);
      }
    }

    // Show loading overlay
    function showLoadingOverlay() {
      const overlay = document.getElementById('download-loading-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      }
    }

    // Hide loading overlay
    function hideLoadingOverlay() {
      const overlay = document.getElementById('download-loading-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
      }
    }

    // Initialize
    document.addEventListener("DOMContentLoaded", function() {
      createLoadingOverlay();
    });
  </script>
  `;
    // Loading overlay styles that need to be included in export
    const loadingOverlayStyles = `
      /* Loading overlay styles */
      #download-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: none;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .loading-content {
        text-align: center;
        color: white;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .loading-content p {
        margin-top: 16px;
        font-size: 18px;
        font-weight: 500;
      }

      .loading-svg {
        animation: spin 1.5s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Responsive adjustments */
      @media (max-width: 767px) {
        .loading-content p {
          font-size: 16px;
        }
        .loading-svg {
          width: 40px;
          height: 40px;
        }
      }

      @media (max-width: 480px) {
        .loading-content p {
          font-size: 14px;
        }
        .loading-svg {
          width: 36px;
          height: 36px;
        }
      }
    `;

    // Combine everything into a proper HTML structure
    const htmlContent = `<!DOCTYPE html>
<html lang="${pageContent?.language}">
<head>
  ${headContent}
  <style>
    ${editor.getCss()}
    ${
      site?.data?.platform == PLATFORMS[2].value
        ? `
    `
        : loadingOverlayStyles
    }
  </style>
  ${
    site?.data?.platform == PLATFORMS[2].value
      ? `
  
  `
      : `<script>
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
       // Show loading overlay
       showLoadingOverlay();
       
       // Hide loading overlay after 3 seconds (adjust as needed)
       setTimeout(() => {
         hideLoadingOverlay();
       }, 3000);
       
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
       
       // Add click handler to Download button specifically
       const downloadBtn = document.getElementById('Download');
       if (downloadBtn) {
         downloadBtn.addEventListener('click', handleDownloadClick);
       }
     });
  </script>
`
  }
</head>
<body${bodyAttributes ? ` ${bodyAttributes}` : ""}>
  ${bodyContent}
  ${
    site?.data?.platform == PLATFORMS[2].value
      ? `
  `
      : loadingOverlayScript
  }
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
    // State to track temporarily disabled button
    let tempDisabledExport = false;
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
        transition: all 0.2s ease;
        z-index: 999;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
      }
      .export-btn {
        background-color: #2563eb;
      }
      .export-btn:hover:not(.loading):not(.disabled) {
        background-color: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .deploy-btn {
        background-color: #16a34a;
      }
      .deploy-btn:hover:not(.loading):not(.disabled) {
        background-color: #15803d;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .custom-btn.loading {
        opacity: 0.8;
        cursor: not-allowed;
        pointer-events: none;
      }
      .custom-btn.loading::after {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: loading-shine 1.5s infinite;
      }
      .custom-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
        background-color: #6b7280 !important;
      }
      .custom-btn.disabled:hover {
        transform: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .custom-btn.success {
        background-color: #059669 !important;
      }
      .custom-btn.error {
        background-color: #dc2626 !important;
      }
      .export-deploy-btn {
        background-color: #7c3aed;
      }
      .export-deploy-btn:hover:not(.loading):not(.disabled) {
        background-color: #6d28d9;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      @keyframes loading-shine {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);

    // Register export command
    editor.Commands.add("export-html", {
      run: async () => {
        if (!site?.data) {
          toast.error("Site data not loaded");
          return Promise.reject(new Error("Site data not loaded"));
        }

        // Temporarily disable the button for 3 seconds
        setTempDisabledExport();

        return toast.promise(exportHTMLWithCSS(editor), {
          loading: "Exporting HTML...",
          success: "Export completed successfully!",
          error: (err) =>
            `Export failed: ${err instanceof Error ? err.message : "Please try again"}`,
        });
      },
    });

    // Register deploy command
    // editor.Commands.add("deploy-page", {
    //   run: async () => {
    //     if (!site?.data) {
    //       toast.error("Site data not loaded");
    //       return Promise.reject(new Error("Site data not loaded"));
    //     }

    //     // Temporarily disable the button for 3 seconds
    //     setTempDisabledExport();

    //     return toast.promise(
    //       deployPageMutation.mutateAsync({
    //         site_id: Number(siteId),
    //         page_slugs: [slug],
    //       }),
    //       {
    //         loading: "Deploying page...",
    //         success: "Deploy completed successfully!",
    //         error: (err) =>
    //           `Deploy failed: ${err instanceof Error ? err.message : "Please try again"}`,
    //       }
    //     );
    //   },
    // });

    // Combined export and deploy command (commented out)
    // editor.Commands.add("export-and-deploy", {
    //   run: async () => {
    //     if (!site?.data) {
    //       toast.error(t("SiteDataNotLoaded"));
    //       throw new Error("Site data not loaded");
    //     }

    //     try {
    //       // First export - making sure it completes fully
    //       const exportResult = await toast.promise(exportHTMLWithCSS(editor), {
    //         loading: t("ExportHTML"),
    //         success: t("ExportSuccess"),
    //         error: (err) =>
    //           t("ExportError", {
    //             error: err instanceof Error ? err.message : "Please try again",
    //           }),
    //       });

    //       // Wait to ensure export is fully processed
    //       console.log("Export completed successfully:", exportResult);

    //       // Then deploy after export is confirmed complete
    //       return toast.promise(
    //         deployPageMutation.mutateAsync({
    //           site_id: Number(siteId),
    //           page_slugs: [slug],
    //         }),
    //         {
    //           loading: t("DeployPage"),
    //           success: t("DeploySuccess"),
    //           error: (err) =>
    //             t("DeployError", {
    //               error:
    //                 err instanceof Error ? err.message : "Please try again",
    //             }),
    //         }
    //       );
    //     } catch (err) {
    //       toast.error(t("ExportAndDeployError"), {
    //         description:
    //           err instanceof Error ? err.message : "Please try again",
    //       });
    //       throw err;
    //     }
    //   },
    // });

    // Helper function to temporarily disable export button
    const setTempDisabledExport = () => {
      tempDisabledExport = true;
      setTimeout(() => {
        tempDisabledExport = false;
        updateButtonStates(); // Update button appearance after timeout
      }, 3000);
    };

    // Helper function to get button state
    const getButtonState = (type: "export" | "deploy") => {
      const isExport = type === "export";
      const mutation = isExport ? exportPageMutation : deployPageMutation;
      const baseLabel = isExport ? "Export HTML" : "Deploy Page";
      const loadingLabel = isExport ? "Exporting..." : "Deploying...";
      const baseClass = `custom-btn ${type}-btn`;

      // Debug logging (remove in production)
      // console.log(`Button ${type} state:`, {
      //   siteData: !!site?.data,
      //   isPending: mutation.isPending,
      //   isError: mutation.isError,
      //   isIdle: mutation.isIdle,
      //   status: mutation.status,
      //   tempDisabled: tempDisabledButtons[type],
      // });

      if (!site?.data) {
        return {
          label: "Loading site data...",
          className: `${baseClass} disabled`,
          disabled: true,
        };
      }

      // Check if temporarily disabled (3s cooldown)
      if (tempDisabledExport) {
        return {
          label: baseLabel,
          className: `${baseClass} disabled`,
          disabled: true,
        };
      }

      // Only show loading if actively pending
      if (mutation.isPending === true) {
        return {
          label: loadingLabel,
          className: `${baseClass} loading`,
          disabled: true,
        };
      }

      if (mutation.isError) {
        return {
          label: baseLabel,
          className: `${baseClass} error`,
          disabled: false,
        };
      }

      // Default idle state
      return {
        label: baseLabel,
        className: baseClass,
        disabled: false,
      };
    };

    // Add a panel with separate export and deploy buttons
    const exportState = getButtonState("export");
    // const deployState = getButtonState("deploy");

    editor.Panels.addPanel({
      id: "custom-panel",
      visible: true,
      buttons: [
        {
          id: "export-btn",
          label: exportState.label,
          command: "export-html",
          className: exportState.className,
          attributes: {
            disabled: exportState.disabled,
            title: exportState.disabled
              ? !site?.data
                ? "Waiting for site data"
                : tempDisabledExport
                  ? "Please wait 3 seconds before clicking again"
                  : "Export in progress"
              : "Export HTML",
          },
        },
        // {
        //   id: "deploy-btn",
        //   label: deployState.label,
        //   command: "deploy-page",
        //   className: deployState.className,
        //   attributes: {
        //     disabled: deployState.disabled,
        //     title: deployState.disabled
        //       ? !site?.data
        //         ? "Waiting for site data"
        //         : tempDisabledExport
        //           ? "Please wait 3 seconds before clicking again"
        //           : "Deploy in progress"
        //       : "Deploy Page",
        //   },
        // },
      ],
    });

    // Function to update button states dynamically
    const updateButtonStates = () => {
      const exportBtn = editor.Panels.getButton("custom-panel", "export-btn");
      const deployBtn = editor.Panels.getButton("custom-panel", "deploy-btn");

      if (exportBtn) {
        const exportState = getButtonState("export");
        exportBtn.set({
          label: exportState.label,
          className: exportState.className,
          attributes: {
            disabled: exportState.disabled,
            title: exportState.disabled
              ? !site?.data
                ? "Waiting for site data"
                : tempDisabledExport
                  ? "Please wait 3 seconds before clicking again"
                  : "Export in progress"
              : "Export HTML",
          },
        });
      }

      if (deployBtn) {
        const deployState = getButtonState("deploy");
        deployBtn.set({
          label: deployState.label,
          className: deployState.className,
          attributes: {
            disabled: deployState.disabled,
            title: deployState.disabled
              ? !site?.data
                ? "Waiting for site data"
                : tempDisabledExport
                  ? "Please wait 3 seconds before clicking again"
                  : "Deploy in progress"
              : "Deploy Page",
          },
        });
      }
    };

    // Update button states initially and when mutations change
    updateButtonStates();

    // Update button states periodically to reflect mutation state changes
    const updateInterval = setInterval(updateButtonStates, 1000);

    // Cleanup interval when editor is destroyed
    editor.on("destroy", () => {
      clearInterval(updateInterval);
    });
  };

  // If loading, show loading state
  if (isPageLoading || isSiteLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">
            {isPageLoading ? t("LoadingPage") : t("LoadingSiteData")}
          </div>
          <div className="text-muted-foreground text-sm">{t("PleaseWait")}</div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (isPageError || isSiteError) {
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
                await toast.promise(
                  deleteAssets({
                    assets,
                    editor,
                    siteId,
                  }),
                  {
                    loading: t("DeletingAssets"),
                    success: t("AssetsDeletedSuccessfully"),
                    error: t("FailedToDeleteAssets"),
                  }
                );
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
