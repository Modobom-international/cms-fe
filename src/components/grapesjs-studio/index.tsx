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

    // Monitor download start
    function monitorDownload(url) {
      return new Promise((resolve, reject) => {
        // Create a hidden iframe to handle the download
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);

        // Set a timeout to hide loading after reasonable time
        const timeout = setTimeout(() => {
          hideLoadingOverlay();
          document.body.removeChild(iframe);
          resolve('Download started');
        }, 3000); // 3 seconds timeout

        // Try to detect when download starts by monitoring the iframe load
        iframe.onload = () => {
          clearTimeout(timeout);
          hideLoadingOverlay();
          document.body.removeChild(iframe);
          resolve('Download completed');
        };

        iframe.onerror = () => {
          clearTimeout(timeout);
          hideLoadingOverlay();
          document.body.removeChild(iframe);
          reject('Download failed');
        };
      });
    }

    // Alternative method using fetch to check server response
    async function checkServerResponse(url) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors' // This allows cross-origin requests but limits response data
        });
        return true;
      } catch (error) {
        // If HEAD fails, the server might not support it, so we'll proceed anyway
        return true;
      }
    }

    // Handle download button click
    function handleDownloadClick(e) {
      e.preventDefault(); // Prevent immediate navigation
      
      const downloadLink = e.target;
      const downloadUrl = downloadLink.href;
      
      // Check if this is an Android Intent URL
      if (downloadUrl.startsWith('@intent://')) {
        // For Android Intent URLs, we'll use a direct approach
        showLoadingOverlay();
        
        

        // Create a temporary link element
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
        
        // Add click event to handle completion
        tempLink.onclick = function() {
          // Hide overlay after a short delay
          setTimeout(hideLoadingOverlay, 1000);
        };
        
        // Trigger the click
        tempLink.click();
        
        // Fallback: hide overlay after 5 seconds if not hidden already
        setTimeout(hideLoadingOverlay, 5000);
        return;
      }
      
      // Regular download handling for non-Intent URLs
      showLoadingOverlay();
      
      // Report conversion if available
      if (typeof gtag_report_conversion === "function") {
        gtag_report_conversion();
      }

      // Method 1: Monitor server response with fetch
      async function checkServerAndDownload() {
        try {
          // First, try to fetch the URL to check server response
          const response = await fetch(downloadUrl, {
            method: 'GET',
            mode: 'no-cors' // Handle CORS issues
          });
          
          // If we get here, server responded, start download
          startDownloadWithIframe();
          
        } catch (error) {
          console.log('Fetch failed, trying iframe method directly');
          // If fetch fails due to CORS or other issues, try iframe method
          startDownloadWithIframe();
        }
      }

      // Method 2: Use iframe and monitor load events
      function startDownloadWithIframe() {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        
        let responseReceived = false;
        
        // Monitor iframe load events
        iframe.onload = function() {
          if (!responseReceived) {
            responseReceived = true;
            console.log('Server responded - download should start');
            hideLoadingOverlay();
            
            // Clean up iframe after a delay
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 2000);
          }
        };
        
        iframe.onerror = function() {
          console.log('Download error occurred');
          responseReceived = true;
          hideLoadingOverlay();
          // Show error or fallback to direct navigation
          window.location.href = downloadUrl;
        };
        
        // Set a maximum timeout for server response (30 seconds)
        const maxTimeout = setTimeout(() => {
          if (!responseReceived) {
            console.log('Server response timeout');
            responseReceived = true;
            hideLoadingOverlay();
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            // Fallback to direct navigation
            window.location.href = downloadUrl;
          }
        }, 30000); // 30 second maximum wait
        
        // Add iframe to DOM and start download
        document.body.appendChild(iframe);
        iframe.src = downloadUrl;
        
        // Clean up timeout when response is received
        iframe.addEventListener('load', () => {
          clearTimeout(maxTimeout);
        });
        iframe.addEventListener('error', () => {
          clearTimeout(maxTimeout);
        });
      }

      // Method 3: Monitor document visibility and focus (backup method)
      function monitorPageEvents() {
        let eventTimeout;
        
        const handleVisibilityChange = () => {
          if (document.hidden) {
            // Page became hidden, might indicate download started
            eventTimeout = setTimeout(() => {
              hideLoadingOverlay();
            }, 1000);
          } else if (eventTimeout) {
            clearTimeout(eventTimeout);
          }
        };
        
        const handleFocusChange = () => {
          // Browser focus changed, might indicate download dialog
          eventTimeout = setTimeout(() => {
            hideLoadingOverlay();
          }, 1500);
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleFocusChange);
        
        // Clean up listeners after 35 seconds
        setTimeout(() => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('blur', handleFocusChange);
          if (eventTimeout) clearTimeout(eventTimeout);
        }, 35000);
      }

      // Start monitoring with multiple methods
      checkServerAndDownload();
      monitorPageEvents();
    }

    // Initialize
    document.addEventListener("DOMContentLoaded", function() {
      createLoadingOverlay();
      
      // Add click event to Download button
      const downloadBtn = document.getElementById('Download');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownloadClick);
      }
      
      // Also listen for any changes to the DOM in case the button is added later
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const newDownloadBtn = document.getElementById('Download');
            if (newDownloadBtn && !newDownloadBtn.hasAttribute('data-listener-added')) {
              newDownloadBtn.setAttribute('data-listener-added', 'true');
              newDownloadBtn.addEventListener('click', handleDownloadClick);
            }
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
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
    ${loadingOverlayStyles}
  </style>
  
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
  ${loadingOverlayScript}
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
