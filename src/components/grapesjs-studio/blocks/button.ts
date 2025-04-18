export const buttonBlock = (editor: any) => {
  const blockManager = editor.BlockManager;

  blockManager.add("custom-button", {
    label: "Download Button",
    category: "Basic",
    content: {
      type: "link",
      content: "Download",
      style: {
        // Base styles
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
        // Fixed position styles
        position: "fixed",
        top: "0",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        "max-width": "600px",
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        "background-color": "rgba(255,255,255,0.95)",
        "z-index": "9999",
        "text-decoration": "none",
      },
      attributes: {
        class: "custom-button download",
        id: "Download"
      },
    },
    media: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    `,
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
          .custom-button {
            min-height: 44px;
            max-width: 600px !important;
            width: calc(100% - 32px) !important; /* Account for margins */
            margin-left: auto !important;
            margin-right: auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            box-sizing: border-box;
            animation: fadeIn 0.3s ease-in-out;
          }

          .custom-button:hover {
            transform: translateX(-50%) scale(1.05) !important;
            background: linear-gradient(90deg, #F50057, #C51162);
          }
          
          /* Ensure content below button is pushed down */
          body > *:not(.download) {
            margin-top: 70px;
          }

          /* Large screens (desktop) */
          @media (min-width: 1024px) {
            .custom-button {
              padding: 12px 30px;
              font-size: 16px;
              height: 60px;
            }
          }
          
          /* Medium screens (tablets) */
          @media (max-width: 1023px) and (min-width: 768px) {
            .custom-button {
              padding: 10px 25px;
              font-size: 15px;
              height: 55px;
              max-width: 500px !important;
            }
            body > *:not(.download) {
              margin-top: 65px;
            }
          }
          
          /* Small screens (mobile) */
          @media (max-width: 767px) {
            .custom-button {
              padding: 8px 20px;
              font-size: 14px;
              height: 50px;
              max-width: 400px !important;
            }
            body > *:not(.download) {
              margin-top: 60px;
            }
          }
          
          /* Extra small screens */
          @media (max-width: 480px) {
            .custom-button {
              padding: 8px 15px;
              font-size: 13px;
              height: 44px;
              max-width: 100% !important;
              width: calc(100% - 16px) !important; /* Smaller margins on mobile */
            }
            body > *:not(.download) {
              margin-top: 54px;
            }
          }

          /* Handle orientation changes */
          @media screen and (orientation: landscape) and (max-height: 500px) {
            .custom-button {
              height: 40px;
              padding: 6px 15px;
            }
            body > *:not(.download) {
              margin-top: 50px;
            }
          }
          
          /* High DPI screens */
          @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .custom-button {
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
          }

          /* Reduced motion preference */
          @media (prefers-reduced-motion: reduce) {
            .custom-button {
              transition: none;
            }
            .custom-button:hover {
              transform: translateX(-50%) !important;
            }
          }
          
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
        `,
      },
    },
  });
};
