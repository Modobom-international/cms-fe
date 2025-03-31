"use client";

import React, { useState } from "react";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

interface WebBuilderStudioProps {
  slug: string;
}

export default function WebBuilderStudio({ slug }: WebBuilderStudioProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    message: string;
    type: "success" | "error" | "info" | null;
  }>({ message: "", type: null });

  const saveToAPI = async (project: any) => {
    try {
      setIsSaving(true);
      setSaveStatus({ message: "Saving...", type: "info" });

      const response = await fetch(`http://127.0.0.1:8000/api/update-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: slug,
          content: JSON.stringify(project),
        }),
      });

      if (!response.ok) {
        // If the page doesn't exist yet (404), create it instead
        if (response.status === 404) {
          return createNewPage(project);
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setSaveStatus({ message: "Page saved successfully!", type: "success" });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save project";

      setSaveStatus({
        message: `Error saving page: ${errorMessage}`,
        type: "error",
      });

      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to create a new page if it doesn't exist
  const createNewPage = async (project: any) => {
    try {
      console.log(`Page ${slug} doesn't exist, creating it now.`);
      setSaveStatus({ message: "Creating new page...", type: "info" });

      const response = await fetch("http://127.0.0.1:8000/api/create-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site_id: 1,
          name: slug,
          slug: slug,
          content: JSON.stringify(project),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setSaveStatus({
        message: "New page created successfully!",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create new page";

      setSaveStatus({
        message: `Error creating page: ${errorMessage}`,
        type: "error",
      });

      throw new Error(errorMessage);
    }
  };

  const loadFromAPI = async () => {
    try {
      // Simulate network delay (for demo purposes)
      await new Promise((res) => setTimeout(res, 1000));

      const response = await fetch(`http://127.0.0.1:8000/api/page/${slug}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.data.content);
      console.log(`Loaded content for slug: ${slug}`, content);
      return content;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load project";

      console.warn(`Could not load content for slug: ${slug}`, errorMessage);
      throw new Error(errorMessage);
    }
  };

  const exportHTMLWithCSS = async (editor: any) => {
    try {
      setIsSaving(true);
      setSaveStatus({ message: "Exporting HTML...", type: "info" });

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
      formData.append("slug", slug);

      const response = await fetch("http://127.0.0.1:8000/api/export-pages", {
        method: "POST",
        body: formData, // Send as FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const result = await response.json();
      console.log(`HTML exported successfully for slug: ${slug}`, result);

      setSaveStatus({
        message: "HTML exported successfully!",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: "", type: null });
      }, 3000);

      return result;
    } catch (error) {
      console.error(`Failed to export HTML for slug: ${slug}`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to export HTML";

      setSaveStatus({
        message: `Export error: ${errorMessage}`,
        type: "error",
      });

      throw new Error("Failed to export HTML");
    } finally {
      setIsSaving(false);
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
          label: `Export ${slug}`,
          command: "export-html",
          className: "export-btn",
        },
      ],
    });
  };

  return (
    <div className="relative h-screen w-screen">
      {/* Status notification */}
      {saveStatus.type && (
        <div
          className={`fixed top-4 right-4 z-[9999] rounded px-4 py-2 shadow-md ${
            saveStatus.type === "success"
              ? "bg-green-500"
              : saveStatus.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
          } text-white`}
        >
          {isSaving && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          )}
          {saveStatus.message}
        </div>
      )}

      <StudioEditor
        options={{
          licenseKey: env.NEXT_PUBLIC_GRAPESJS_LICENSE_KEY,
          storage: {
            type: "self",
            autosaveChanges: 5, // save after every 5 changes

            onSave: async ({ project, editor }) => {
              try {
                await saveToAPI(project); // Save JSON data
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

                // Always return a valid project data structure
                return {
                  project: project || {
                    pages: [
                      { name: slug, component: `<h1>New page: ${slug}</h1>` },
                    ],
                  },
                };
              } catch (error) {
                console.error(
                  `Failed to load project for slug: ${slug}`,
                  error
                );
                // Return fallback project instead of null
                return {
                  project: {
                    pages: [
                      {
                        name: slug,
                        component: `<h1>New page: ${slug}</h1><p>Start building your page here.</p>`,
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
                  component: `<h1>New page: ${slug}</h1><p>Start building your page here.</p>`,
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

