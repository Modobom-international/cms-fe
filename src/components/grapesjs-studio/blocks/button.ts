export const buttonBlock = (editor: any) => {
  const blockManager = editor.BlockManager;

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
        `,
      },
    },
  });
};
