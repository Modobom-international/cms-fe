"use client";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

export default function WebBuilderStudio() {
  const saveToAPI = async (project: any) => {
    try {
      // Simulate network delay (for demo purposes)
      await new Promise((res) => setTimeout(res, 1000));

      const response = await fetch(
        "https://648867740e2469c038fda6cc.mockapi.io/api/v1/cms/1",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(project),
        }
      );

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

      const response = await fetch(
        "https://648867740e2469c038fda6cc.mockapi.io/api/v1/cms"
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load project";

      throw new Error(errorMessage);
    }
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
                // await saveToAPI(project);
                console.log("Project saved", { project });
                console.log(">>>>>>>CSS", editor.getCss());
                console.log(">>>>>>>HTML", editor.getHtml());
              } catch (error) {
                console.error("Failed to save project:", error);
              }
            },

            onLoad: async () => {
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
        }}
      />
    </div>
  );
}
