export const buttonBlock = (editor: any) => {
  const blockManager = editor.BlockManager;

  // Add loading overlay styles and script to both button blocks
  const loadingOverlayScript = `
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
  `;

  // Add loading overlay styles
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

  blockManager.add("custom-button", {
    label: "Download Button",
    category: "Basic",
    content: {
      type: "link",
      content: "Download",
      draggable: true,
      droppable: true,
      attributes: {
        class: "custom-button download sticky-button",
      },
      style: {
        background: "linear-gradient(90deg, #FF4081, #F50057)",
        color: "white",
        border: "none",
        padding: "12px 30px",
        "font-size": "16px",
        "border-radius": "30px",
        "font-weight": "bold",
        cursor: "pointer",
        "box-shadow": "0 4px 14px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease-in-out",
        width: "100%",
        "max-width": "600px",
        margin: "20px auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        "background-color": "rgba(255,255,255,0.95)",
        "z-index": "9999",
        "text-decoration": "none",
      },
      script: `
        document.addEventListener("DOMContentLoaded", function () {
          const stickyButton = document.querySelector(".sticky-button");
          if (!stickyButton) return;
          
          const stickyOffset = stickyButton.offsetTop;
          
          function handleScroll() {
            if (window.pageYOffset > stickyOffset) {
              stickyButton.classList.add("is-sticky");
            } else {
              stickyButton.classList.remove("is-sticky");
            }
          }
          
          window.addEventListener("scroll", handleScroll);
        });

        ${loadingOverlayScript}
      `,
    },
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    `,
  });

  // New sticky button
  blockManager.add("sticky-download-button", {
    label: "Sticky Download Button",
    category: "Basic",
    content: {
      type: "link",
      content: "Download",
      draggable: true,
      droppable: true,
      attributes: {
        class: "sticky-download-button",
      },
      style: {
        background: "linear-gradient(90deg, #FF4081, #F50057)",
        color: "white",
        border: "none",
        padding: "12px 30px",
        "font-size": "16px",
        "border-radius": "30px",
        "font-weight": "bold",
        cursor: "pointer",
        "box-shadow": "0 4px 14px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease-in-out",
        width: "100%",
        "max-width": "600px",
        margin: "20px auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        "background-color": "rgba(255,255,255,0.95)",
        "z-index": "9999",
        "text-decoration": "none",
      },
      script: `
        document.addEventListener("DOMContentLoaded", function () {
          const stickyButton = document.querySelector(".sticky-download-button");
          if (!stickyButton) return;
          
          const stickyOffset = stickyButton.offsetTop;
          
          function handleScroll() {
            if (window.pageYOffset > stickyOffset) {
              stickyButton.classList.add("is-sticky");
            } else {
              stickyButton.classList.remove("is-sticky");
            }
          }
          
          window.addEventListener("scroll", handleScroll);
        });

        ${loadingOverlayScript}
      `,
    },
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    `,
  });

  // We'll add an ID protection rule to the editor for both buttons
  editor.on("component:add", (component: any) => {
    const attrs = component.getAttributes();
    if (attrs.class?.includes("custom-button download")) {
      component.setAttributes({ ...attrs, id: "Download" });
    }
    if (attrs.class?.includes("sticky-download-button")) {
      component.setAttributes({ ...attrs, id: "Download" });
    }
  });

  // Update the styles in the link component
  editor.DomComponents.addType("link", {
    model: {
      defaults: {
        traits: [
          {
            type: "text",
            name: "href",
            label: "Link URL",
          },
          {
            type: "select",
            name: "target",
            label: "Target",
            options: [
              { value: "_self", name: "Same window" },
              { value: "_blank", name: "New window" },
            ],
          },
        ],
        styles: `
          /* Original fixed button styles */
          .custom-button {
            min-height: 44px;
            max-width: 600px !important;
            width: calc(100% - 32px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            box-sizing: border-box;
            animation: fadeIn 0.3s ease-in-out;
            position: fixed;
            top: 0;
          }

          .custom-button:hover {
            transform: translateX(-50%) scale(1.05) !important;
            background: linear-gradient(90deg, #F50057, #C51162);
          }

          /* New sticky button styles */
          .sticky-download-button {
            min-height: 44px;
            max-width: 600px !important;
            width: calc(100% - 32px) !important;
            margin: 20px auto !important;
            box-sizing: border-box;
            position: relative;
            transition: all 0.3s ease-in-out;
          }

          .sticky-download-button.is-sticky {
            position: fixed !important;
            top: 0 !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            margin-top: 0 !important;
            animation: slideDown 0.3s ease-in-out;
            margin-top: 10px !important;
          }

          .sticky-download-button:hover {
            transform: scale(1.05);
            background: linear-gradient(90deg, #F50057, #C51162);
          }

          .sticky-download-button.is-sticky:hover {
            transform: translateX(-50%) scale(1.05) !important;
          }

          /* Animations */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -10px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }

          @keyframes slideDown {
            from {
              transform: translateX(-50%) translateY(-100%);
            }
            to {
              transform: translateX(-50%) translateY(0);
            }
          }

          /* Responsive styles */
          @media (min-width: 1024px) {
            .custom-button,
            .sticky-download-button {
              padding: 12px 30px;
              font-size: 16px;
              height: 60px;
            }
          }
          
          @media (max-width: 1023px) and (min-width: 768px) {
            .custom-button,
            .sticky-download-button {
              padding: 10px 25px;
              font-size: 15px;
              height: 55px;
              max-width: 500px !important;
            }
          }
          
          @media (max-width: 767px) {
            .custom-button,
            .sticky-download-button {
              padding: 8px 20px;
              font-size: 14px;
              height: 50px;
              max-width: 400px !important;
            }
          }
          
          @media (max-width: 480px) {
            .custom-button,
            .sticky-download-button {
              padding: 8px 15px;
              font-size: 13px;
              height: 44px;
              max-width: 100% !important;
              width: calc(100% - 16px) !important;
            }
          }

          @media screen and (orientation: landscape) and (max-height: 500px) {
            .custom-button,
            .sticky-download-button {
              height: 40px;
              padding: 6px 15px;
            }
          }
          
          @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .custom-button,
            .sticky-download-button {
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .custom-button,
            .sticky-download-button {
              transition: none;
            }
            .sticky-download-button.is-sticky:hover {
              transform: translateX(-50%) !important;
            }
            .custom-button:hover {
              transform: translateX(-50%) !important;
            }
          }

          ${loadingOverlayStyles}
        `,
      },
    },
  });
};

