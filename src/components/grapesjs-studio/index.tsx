"use client";

import React, { useState } from "react";

import { env } from "@/env";
import StudioEditor from "@grapesjs/studio-sdk/react";
import type { LoadResultProps } from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

export default function WebBuilderStudio() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToAPI = async (project: any) => {
    try {
      setIsLoading(true);
      setError(null);

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
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen">
      {error && (
        <div className="absolute top-2 right-2 z-50 rounded-md bg-red-600 p-3 text-white shadow-lg">
          {error}
          <button className="ml-2 font-bold" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="rounded-md bg-white p-4 shadow-lg">Loading...</div>
        </div>
      )}
      <StudioEditor
        options={{
          licenseKey: env.NEXT_PUBLIC_BACKEND_URL,
          storage: {
            type: "self",
            autosaveChanges: 5, // save after every 5 changes

            onSave: async ({ project }) => {
              try {
                await saveToAPI(project);
                console.log("Project saved", { project });
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
                } as LoadResultProps;
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
                } as LoadResultProps;
              }
            },
          },
          project: {
            type: "web",
            // Default acts as fallback project, in case the load fails
            default: {
              pages: [
                {
                  name: "Home",
                  component: "<h1>Fallback Project, reload to retry</h1>",
                },
                { name: "About", component: "<h1>About page</h1>" },
                { name: "Contact", component: "<h1>Contact page</h1>" },
              ],
            },
          },
        }}
      />
    </div>
  );
}

