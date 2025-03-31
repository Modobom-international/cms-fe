"use client";

import React from "react";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

export default function WebBuilderStudio() {
  const saveToAPI = async (project: any) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/create-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_id: 1,
          name: "test",
          slug: "test8",
          content: JSON.stringify(project),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save project";
      throw new Error(errorMessage);
    }
  };

  const loadFromAPI = async () => {
    try {
      // Simulate network delay (for demo purposes)
      await new Promise((res) => setTimeout(res, 1000));

      const response = await fetch("http://127.0.0.1:8000/api/page/test7");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.data.content);
      console.log(">>>>>>>CONTENT", content);
      return content;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load project";

      throw new Error(errorMessage);
    }
  };

  const exportHTMLWithCSS = async (editor: any) => {
    try {
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
      formData.append("slug", "test8");

      const response = await fetch("http://127.0.0.1:8000/api/export-pages", {
        method: "POST",
        body: formData, // Send as FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Export successful:", result);
      return result;
    } catch (error) {
      console.error("Export failed:", error);
      throw new Error("Failed to export HTML");
    }
  };

  // Plugin to add export button using GrapeJS Panel API
  const exportButtonPlugin = (editor: any) => {
    // Add custom styles for the export button
    const style = document.createElement("style");
    style.innerHTML = `
      .export-btn {
        display: block;
        background-color: #2563eb;
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
      .export-btn:hover {
        background-color: #1d4ed8;
      }
    `;
    document.head.appendChild(style);

    // Register export command
    editor.Commands.add("export-html", {
      run: () => exportHTMLWithCSS(editor),
    });

    // Add a panel with the export button
    editor.Panels.addPanel({
      id: "export-panel",
      visible: true,
      buttons: [
        {
          id: "export-btn",
          label: "Export HTML",
          command: "export-html",
          className: "export-btn",
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
            autosaveChanges: 5, // save after every 5 changes

            onSave: async ({ project, editor }) => {
              try {
                await saveToAPI(project); // Save JSON data
                console.log("Project saved", { project });
              } catch (error) {
                console.error("Failed to save project:", error);
              }
            },

            onLoad: async ({ editor }) => {
              try {
                const project = await loadFromAPI();
                console.log("Project loaded", { project });

                // Always return a valid project data structure
                return {
                  project: project || {
                    pages: [
                      { name: "Home", component: "<h1>New project</h1>" },
                    ],
                  },
                };
              } catch (error) {
                console.error("Failed to load project:", error);
                // Return fallback project instead of null
                return {
                  project: {
                    pages: [
                      {
                        name: "Home",
                        component: "<h1>Fallback Project, reload to retry</h1>",
                      },
                      { name: "About", component: "<h1>About page</h1>" },
                      { name: "Contact", component: "<h1>Contact page</h1>" },
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
                  name: "Home",
                  component: "<h1>Fallback Project, reload to retry</h1>",
                },
              ],
            },
          },
          plugins: [exportButtonPlugin],
        }}
      />
    </div>
  );
}

