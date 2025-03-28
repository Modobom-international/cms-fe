"use client";

import { useEffect } from "react";

import { useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

import Recursive from "./funnel-editor-components/recursive";

// ... existing code ...

export const getFunnelPageDetails = async (funnelPageId: string) => {
  // Mock data that matches the type structure
  const mockFunnelPage = {
    id: funnelPageId,
    name: "Welcome Page",
    pathName: "/welcome",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-15"),
    visits: 123,
    content: "",
    order: 1,
    previewImage: "https://example.com/preview.jpg",
    funnelId: "fn_01HQ2XYZDEF",
  };

  console.log("Fetching funnel page details:", mockFunnelPage);
  return mockFunnelPage;
};

// ... existing code ...

type Props = { funnelPageId: string; liveMode?: boolean };

const FunnelEditor = ({ funnelPageId, liveMode }: Props) => {
  const { dispatch, state } = useEditor();

  useEffect(() => {
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  //CHALLENGE: make this more performant
  useEffect(() => {
    const fetchData = async () => {
      const response = await getFunnelPageDetails(funnelPageId);
      if (!response) return;

      dispatch({
        type: "LOAD_DATA",
        payload: {
          elements: response.content ? JSON.parse(response?.content) : "",
          withLive: !!liveMode,
        },
      });
    };
    fetchData();
  }, [funnelPageId]);

  const handleClick = () => {
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  const handleUnpreview = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  // Helper function to recursively generate HTML from elements
  const generateHtmlFromElements = (elements: Array<any>): string => {
    if (!Array.isArray(elements)) return "";

    return elements
      .map((element): string => {
        // Apply element styles
        const styles = Object.entries(element.styles || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ");

        // Container elements with children
        if (
          element.type === "container" ||
          element.type === "2Col" ||
          element.type === "__body"
        ) {
          return `<div style="${styles}" data-element-type="${
            element.type
          }" data-element-id="${element.id}">
          ${
            Array.isArray(element.content)
              ? generateHtmlFromElements(element.content)
              : ""
          }
        </div>`;
        }

        // Text elements
        else if (element.type === "text") {
          return `<div style="${styles}" data-element-type="${
            element.type
          }" data-element-id="${element.id}">
          ${
            typeof element.content === "object" && element.content.innerText
              ? element.content.innerText
              : ""
          }
        </div>`;
        }

        // Link elements
        else if (element.type === "link") {
          return `<a href="${
            typeof element.content === "object" && element.content.href
              ? element.content.href
              : "#"
          }" 
          style="${styles}" data-element-type="${
            element.type
          }" data-element-id="${element.id}">
          ${
            typeof element.content === "object" && element.content.innerText
              ? element.content.innerText
              : "Link"
          }
        </a>`;
        }

        // Video elements
        else if (element.type === "video") {
          return `<iframe 
          src="${
            typeof element.content === "object" && element.content.src
              ? element.content.src
              : ""
          }" 
          style="${styles}" data-element-type="${
            element.type
          }" data-element-id="${element.id}"
          frameborder="0" allowfullscreen></iframe>`;
        }

        // Contact form (simplified)
        else if (element.type === "contactForm") {
          return `<div style="${styles}" data-element-type="${element.type}" data-element-id="${element.id}">
          <form>
            <div><input type="text" placeholder="Name" /></div>
            <div><input type="email" placeholder="Email" /></div>
            <div><button type="submit">Submit</button></div>
          </form>
        </div>`;
        }

        // Default for unhandled element types
        return `<div style="${styles}" data-element-type="${element.type}" data-element-id="${element.id}"></div>`;
      })
      .join("\n");
  };

  return (
    <div
      className={clsx(
        "use-automation-zoom-in bg-background mr-[385px] h-full overflow-scroll rounded-md transition-all",
        {
          "!mr-0 !p-0":
            state.editor.previewMode === true || state.editor.liveMode === true,
          "!w-[850px]": state.editor.device === "Tablet",
          "!w-[420px]": state.editor.device === "Mobile",
          "w-full": state.editor.device === "Desktop",
        }
      )}
      onClick={handleClick}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button
          variant={"ghost"}
          size={"icon"}
          className="fixed top-0 left-0 z-[100] h-6 w-6 bg-slate-600 p-[2px]"
          onClick={handleUnpreview}
        >
          <EyeOff />
        </Button>
      )}

      {Array.isArray(state.editor.elements) &&
        state.editor.elements.map((childElement) => (
          <Recursive key={childElement.id} element={childElement} />
        ))}
    </div>
  );
};

export default FunnelEditor;
