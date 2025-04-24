"use client";

import { useEffect, useRef, useState } from "react";

import { Dot, MousePointer } from "lucide-react";

import { IUserTrackingData } from "@/types/user-tracking.type";

interface TrackingSettings {
  useProxy: boolean;
  proxyUrl: string;
  allowExternalContent: boolean;
}

interface DOMVisualizerProps {
  session: IUserTrackingData[] | null;
  currentFrameIndex: number;
  mousePosition: { x: number; y: number };
  scrollPosition: { top: number; left: number };
  settings?: TrackingSettings;
}

export function DOMVisualizer({
  session,
  currentFrameIndex,
  mousePosition,
  scrollPosition,
  settings = {
    useProxy: true,
    proxyUrl: "/api/iframe-proxy",
    allowExternalContent: false,
  },
}: DOMVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<IUserTrackingData | null>(
    null
  );
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [fallbackMode, setFallbackMode] = useState(false);
  const [clickDots, setClickDots] = useState<
    { x: number; y: number; timestamp: string }[]
  >([]);

  // Function to create URL for iframe based on domain and path
  const constructIframeUrl = (domain: string, path: string): string => {
    // Build the full target URL, preserving all query parameters
    const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;
    const fullPath = path.startsWith("/") ? path : `/${path}`;
    const targetUrl = `${baseUrl}${fullPath}`;

    // If using proxy, encode the full URL and pass it to the proxy
    if (settings.useProxy) {
      const encodedUrl = encodeURIComponent(targetUrl);
      return `${settings.proxyUrl}?url=${encodedUrl}`;
    }

    // If external content is allowed, use the direct URL
    if (settings.allowExternalContent) {
      return targetUrl;
    }

    // Default to fallback mode if external content not allowed
    setFallbackMode(true);
    return "";
  };

  // Initialize the session data and iframe URL
  useEffect(() => {
    if (session && session.length > 0) {
      const event = session[0];
      setIsLoading(true);
      setCurrentEvent(event);

      try {
        // Construct URL for iframe
        const url = constructIframeUrl(event.domain, event.path);
        setIframeUrl(url);

        // Set fallback mode if URL is empty (external content not allowed)
        if (!url) {
          setFallbackMode(true);
        } else {
          setFallbackMode(false);
        }
      } catch (error) {
        console.error("Error constructing iframe URL:", error);
        setFallbackMode(true);
      }

      // Set loading state with delay to allow iframe to load
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [session, settings.useProxy, settings.allowExternalContent]);

  // Update current event when frame index changes
  useEffect(() => {
    if (
      session &&
      session.length > 0 &&
      currentFrameIndex >= 0 &&
      currentFrameIndex < session.length
    ) {
      setCurrentEvent(session[currentFrameIndex]);

      // Track clicks for visualization
      const event = session[currentFrameIndex];
      if (
        event.event_name === "click" &&
        event.event_data.x !== undefined &&
        event.event_data.y !== undefined
      ) {
        // Check if this click already exists in our array (avoid duplicates)
        const exists = clickDots.some(
          (dot) =>
            dot.x === event.event_data.x &&
            dot.y === event.event_data.y &&
            dot.timestamp === event.timestamp
        );

        if (!exists) {
          setClickDots((prev) => [
            ...prev,
            {
              x: event.event_data.x as number,
              y: event.event_data.y as number,
              timestamp: event.timestamp,
            },
          ]);
        }
      }
    }
  }, [session, currentFrameIndex]);

  // Handle iframe load event and errors
  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);

      // Add custom style to hide scrollbars in iframe content
      try {
        if (iframeRef.current && iframeRef.current.contentDocument) {
          const style =
            iframeRef.current.contentDocument.createElement("style");
          style.textContent = `
            /* Hide scrollbars for all elements */
            ::-webkit-scrollbar { 
              display: none !important; 
              width: 0 !important; 
              height: 0 !important; 
            }
            
            * { 
              scrollbar-width: none !important; 
              overflow: -moz-scrollbars-none !important;
            }
            
            /* Additional specific targeting for body and html */
            html, body {
              overflow: scroll !important;
              scrollbar-width: none !important;
            }
            
            html::-webkit-scrollbar, body::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
          `;
          iframeRef.current.contentDocument.head.appendChild(style);

          // Force the container to have overflow visible while keeping content scrollable
          if (iframeRef.current.contentDocument.body) {
            iframeRef.current.contentDocument.body.style.overflow = "scroll";
            iframeRef.current.contentDocument.body.style.scrollbarWidth =
              "none";
            // Use setAttribute for non-standard properties to avoid TypeScript errors
            iframeRef.current.contentDocument.body.setAttribute(
              "style",
              `${iframeRef.current.contentDocument.body.getAttribute("style") || ""} 
               -ms-overflow-style: none !important;`
            );
          }

          // Apply to the HTML element too
          if (iframeRef.current.contentDocument.documentElement) {
            iframeRef.current.contentDocument.documentElement.style.overflow =
              "scroll";
            iframeRef.current.contentDocument.documentElement.style.scrollbarWidth =
              "none";
            // Use setAttribute for non-standard properties to avoid TypeScript errors
            iframeRef.current.contentDocument.documentElement.setAttribute(
              "style",
              `${iframeRef.current.contentDocument.documentElement.getAttribute("style") || ""} 
               -ms-overflow-style: none !important;`
            );
          }
        }
      } catch (error) {
        // Ignore cross-origin errors
        console.log("Couldn't modify iframe styles due to cross-origin policy");
      }
    };

    const handleIframeError = () => {
      console.error("Failed to load iframe content");
      setFallbackMode(true);
      setIsLoading(false);
    };

    const iframeElement = iframeRef.current;
    if (iframeElement) {
      iframeElement.addEventListener("load", handleIframeLoad);
      iframeElement.addEventListener("error", handleIframeError);

      // Add additional timeout as a fallback if iframe takes too long to load
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("Iframe load timeout - switching to fallback mode");
          setFallbackMode(true);
          setIsLoading(false);
        }
      }, 8000); // 8 second timeout

      return () => {
        iframeElement.removeEventListener("load", handleIframeLoad);
        iframeElement.removeEventListener("error", handleIframeError);
        clearTimeout(timeoutId);
      };
    }
  }, [iframeRef.current, isLoading]);

  // Apply scroll position to overlay container for synchronization
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollPosition.top;
      containerRef.current.scrollLeft = scrollPosition.left;
    }

    // Also try to sync iframe scroll if available
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.scrollTo({
          top: scrollPosition.top,
          left: scrollPosition.left,
          behavior: "auto",
        });
      } catch (error) {
        // Ignore cross-origin errors
      }
    }
  }, [scrollPosition]);

  if (!session || session.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a session to view playback</p>
      </div>
    );
  }

  // Use session[0] as fallback if current event is not yet set
  const event = currentEvent || session[0];
  const { windowSize, screenWidth, screenHeight } = event.user;

  return (
    <div
      ref={containerRef}
      className="no-scrollbar relative overflow-auto bg-white"
      style={{
        width: `${windowSize.width}px`,
        height: `${windowSize.height}px`,
        maxWidth: "100%",
        maxHeight: "100%",
        transform: "scale(0.8)",
        transformOrigin: "center",
        scrollbarWidth: "none" /* Firefox */,
        msOverflowStyle: "none" /* IE and Edge */,
        overflowY: "scroll",
        overflowX: "scroll",
      }}
    >
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading website content...</p>
          </div>
        </div>
      ) : fallbackMode ? (
        // Fallback content when iframe loading fails or is not allowed
        <div className="flex h-full w-full flex-col items-center justify-center p-8">
          <div className="rounded-lg bg-gray-100 p-8 text-center">
            <h2 className="mb-4 text-xl font-semibold">{event.domain}</h2>
            <p className="mb-4 text-gray-600">
              {event.path.length > 50
                ? `${event.path.substring(0, 50)}...`
                : event.path}
            </p>

            <div className="mb-4 text-sm text-gray-500">
              <p>Device: {event.event_data.device}</p>
              <p>
                Browser: {event.user.browser.name} {event.user.browser.version}
              </p>
              <p>
                Screen: {event.user.screenWidth} × {event.user.screenHeight}
              </p>
            </div>

            {!settings.allowExternalContent && !settings.useProxy && (
              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-700">
                External content is disabled. Enable content proxy or allow
                external content in settings.
              </div>
            )}

            {settings.useProxy && fallbackMode && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                Unable to load content through proxy. The website may be
                blocking proxy requests or the content may be unavailable.
              </div>
            )}

            <div className="mt-4 flex justify-center gap-2">
              <button className="rounded bg-blue-500 px-4 py-2 text-white">
                Sample Button 1
              </button>
              <button className="rounded bg-green-500 px-4 py-2 text-white">
                Sample Button 2
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Iframe with interaction overlay
        <div className="relative h-full w-full">
          {/* Iframe with website content - with pointer-events-none to prevent interaction */}
          {iframeUrl && (
            <div className="relative h-full w-full">
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                className="no-scrollbar pointer-events-none h-full w-full"
                style={{
                  userSelect: "none",
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* IE and Edge */,
                  overflow: "scroll" /* Enable scrolling but hide scrollbars */,
                  border: "none",
                  margin: 0,
                  padding: 0,
                }}
                scrolling="no" /* Old school attribute to hide scrollbars */
                sandbox={
                  settings.useProxy
                    ? "allow-same-origin allow-scripts"
                    : "allow-scripts"
                }
                loading="lazy"
                title={`Content from ${event.domain}`}
                onError={() => setFallbackMode(true)}
              />
              {/* Add a transparent overlay to block all interactions */}
              <div
                className="absolute inset-0 bg-transparent"
                style={{ zIndex: 10 }}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Interactive overlay for visualizing user actions */}
          <div
            ref={overlayRef}
            className="no-scrollbar pointer-events-none absolute inset-0 z-50"
            style={{ overflow: "hidden" }}
          >
            {/* Persistent click dots - like Hotjar */}
            {clickDots.map((dot, index) => (
              <div
                key={`click-dot-${index}-${dot.timestamp}`}
                className="absolute z-20 h-6 w-6 rounded-full border-2 border-red-500 bg-red-500 opacity-40"
                style={{
                  left: `${dot.x - 12}px`,
                  top: `${dot.y - 12}px`,
                  transform: "translate(-50%, -50%)",
                }}
                title={`Click at ${dot.timestamp}`}
              >
                <span className="relative flex h-full w-full">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-30"></span>
                </span>
              </div>
            ))}

            {/* Current click animation */}
            {event.event_name === "click" &&
              event.event_data.elementDetails && (
                <div
                  className="absolute z-25 h-12 w-12 animate-ping rounded-full bg-red-500 opacity-60"
                  style={{
                    left: `${event.event_data.x! - 24}px`,
                    top: `${event.event_data.y! - 24}px`,
                  }}
                ></div>
              )}

            {/* Highlight elements that were interacted with */}
            {event.event_name === "click" &&
              event.event_data.elementDetails && (
                <div
                  className="absolute z-10 border-2 border-red-500"
                  style={{
                    left: `${event.event_data.elementDetails.position.x}px`,
                    top: `${event.event_data.elementDetails.position.y}px`,
                    width: `${event.event_data.elementDetails.position.width}px`,
                    height: `${event.event_data.elementDetails.position.height}px`,
                  }}
                ></div>
              )}
            {event.event_name === "click" &&
              event.event_data.elementDetails && (
                <Dot
                  className="text-blue-600"
                  size={100}
                  style={{
                    left: `${event.event_data.elementDetails.position.x}px`,
                    top: `${event.event_data.elementDetails.position.y}px`,
                    width: `${event.event_data.elementDetails.position.width}px`,
                    height: `${event.event_data.elementDetails.position.height}px`,
                  }}
                />
              )}

            {/* Render mouse cursor */}
            <div
              className="pointer-events-none absolute z-30"
              style={{
                left: `${mousePosition.x}px`,
                top: `${mousePosition.y}px`,
                transition: "all 0.1s ease-out",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

