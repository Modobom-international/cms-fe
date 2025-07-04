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
  const saveToAPI = async (project: any, editor: Editor) => {
    try {
      // First save the project data
      await updatePageMutation.mutateAsync({
        pageId: pageId,
        content: JSON.stringify(project),
      });

      // Then export HTML with CSS if site data is available
      if (site?.data) {
        await exportHTMLWithCSS(editor);
      }
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

  // Plugin simplified since export functionality is now integrated into save
  const customButtonsPlugin = (editor: any) => {
    // Plugin now only registers custom blocks, no UI buttons needed
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
                await toast.promise(saveToAPI(project, editor), {
                  loading: "Saving and exporting page...",
                  success: "Page saved and exported successfully!",
                  error: t("SaveError"),
                });
                console.log(`Project saved and exported for slug: ${slug}`, {
                  project,
                });
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

