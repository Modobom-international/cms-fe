"use client";

import { useEffect, useRef, useState } from "react";

import { format, parseISO } from "date-fns";
import {
  Clock,
  Eye,
  Flame,
  LayoutGrid,
  Monitor,
  MousePointer,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

import {
  IEventData,
  IUser,
  IUserTrackingData,
  IUserTrackingSummary,
} from "@/types/user-tracking.type";

import { DOMVisualizer } from "./dom-visualizer";
import { HeatmapVisualizer } from "./heatmap-visualizer";

interface SessionDetails {
  id: string;
  events: IUserTrackingData[];
  domain: string;
  path: string;
  date: string;
  duration: string;
}

interface SessionStats {
  scrollEvents: number;
  clickEvents: number;
  mouseEvents: number;
  userInfo: IUser;
}

interface TrackingSettings {
  useProxy: boolean;
  proxyUrl: string;
  allowExternalContent: boolean;
}

interface UserTrackingPlayerProps {
  sessions: SessionDetails[];
  settings?: TrackingSettings;
}

export function UserTrackingPlayer({
  sessions,
  settings = {
    useProxy: true,
    proxyUrl: "/api/iframe-proxy",
    allowExternalContent: false,
  },
}: UserTrackingPlayerProps) {
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const [viewMode, setViewMode] = useState<"player" | "heatmap">("player");
  const [isLoading, setIsLoading] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate total session time and set initial values
  const selectSession = (session: SessionDetails): void => {
    setIsLoading(true);
    setSelectedSession(session);
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentFrameIndex(0);

    if (session.events.length > 0) {
      // Sort events by timestamp (past to future)
      const sortedEvents = [...session.events].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Update session with sorted events
      session.events = sortedEvents;

      const firstEventTime = new Date(session.events[0].timestamp).getTime();
      const lastEventTime = new Date(
        session.events[session.events.length - 1].timestamp
      ).getTime();

      // Calculate total time in seconds
      const durationInMs = lastEventTime - firstEventTime;
      setTotalTime(Math.ceil(durationInMs / 1000));

      // Set initial mouse and scroll positions
      const initialEvent = session.events[0];
      if (
        initialEvent.event_name === "mousemove" &&
        initialEvent.event_data.x !== undefined
      ) {
        setMousePosition({
          x: initialEvent.event_data.x,
          y: initialEvent.event_data.y || 0,
        });
      }

      if (initialEvent.event_name === "scroll") {
        setScrollPosition({
          top: initialEvent.event_data.scrollTop || 0,
          left: initialEvent.event_data.scrollLeft || 0,
        });
      }

      // Set loading state to false after a small delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } else {
      setIsLoading(false);
    }
  };

  // Play/pause functionality
  const togglePlayback = (): void => {
    setIsPlaying(!isPlaying);
  };

  // Skip forward/backward
  const skip = (seconds: number): void => {
    setCurrentTime((prev) => {
      const newTime = prev + seconds;
      if (newTime < 0) return 0;
      if (newTime > totalTime) return totalTime;
      return newTime;
    });
  };

  // Find the correct event based on current time
  const updatePlayerFrame = () => {
    if (!selectedSession || selectedSession.events.length === 0) return;

    const events = selectedSession.events;
    const firstEventTime = new Date(events[0].timestamp).getTime();
    const currentTimeMs = currentTime * 1000;
    const targetTime = firstEventTime + currentTimeMs;

    // Find the latest event that occurred before or at the target time
    let frameIndex = 0;
    for (let i = 0; i < events.length; i++) {
      const eventTime = new Date(events[i].timestamp).getTime();
      if (eventTime <= targetTime) {
        frameIndex = i;
      } else {
        break;
      }
    }

    // Update current frame index
    setCurrentFrameIndex(frameIndex);

    // Update mouse position if it's a mouse event
    const currentEvent = events[frameIndex];
    if (
      currentEvent.event_name === "mousemove" &&
      currentEvent.event_data.x !== undefined &&
      currentEvent.event_data.y !== undefined
    ) {
      setMousePosition({
        x: currentEvent.event_data.x,
        y: currentEvent.event_data.y,
      });
    }

    // Update scroll position if it's a scroll event
    if (currentEvent.event_name === "scroll") {
      setScrollPosition({
        top: currentEvent.event_data.scrollTop || 0,
        left: currentEvent.event_data.scrollLeft || 0,
      });
    }
  };

  // Clean up interval
  const cleanupInterval = (): void => {
    if (playerIntervalRef.current) {
      clearInterval(playerIntervalRef.current);
      playerIntervalRef.current = null;
    }
  };

  // Playback interval effect - fix the playback issues
  useEffect(() => {
    // Clean up existing interval first
    cleanupInterval();

    if (isPlaying && totalTime > 0) {
      playerIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            setIsPlaying(false);
            cleanupInterval();
            return totalTime;
          }
          return prev + 0.1 * playbackSpeed;
        });
      }, 100);
    }

    // Clean up on unmount or when dependencies change
    return cleanupInterval;
  }, [isPlaying, totalTime, playbackSpeed]);

  // Update frame when current time changes
  useEffect(() => {
    if (selectedSession) {
      updatePlayerFrame();
    }
  }, [currentTime, selectedSession]);

  // Set first session as default when component mounts
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      selectSession(sessions[0]);
    }
  }, [sessions, selectedSession]);

  // Get statistics for the session
  const getSessionStats = (): SessionStats | null => {
    if (!selectedSession) return null;

    const events = selectedSession.events;
    const scrollEvents = events.filter((e) => e.event_name === "scroll").length;
    const mouseEvents = events.filter(
      (e) => e.event_name === "mousemove"
    ).length;
    const clickEvents = events.filter((e) => e.event_name === "click").length;
    const userInfo = events[0]?.user || {};

    return {
      scrollEvents,
      mouseEvents,
      clickEvents,
      userInfo,
    };
  };

  const stats = getSessionStats();

  // Get window dimensions from the selected session
  const getWindowDimensions = () => {
    if (!selectedSession) return { width: 0, height: 0 };
    return {
      width: selectedSession.events[0].user.windowSize.width,
      height: selectedSession.events[0].user.windowSize.height,
    };
  };

  const { width, height } = getWindowDimensions();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Sessions list */}
      <div className="w-64 overflow-y-auto border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-medium">Sessions</h2>
          <p className="text-sm text-gray-500">Total: {sessions.length}</p>
        </div>

        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => selectSession(session)}
              className={`cursor-pointer border-b border-gray-200 p-4 hover:bg-blue-50 ${
                selectedSession?.id === session.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="font-medium">
                Session {session.id.slice(0, 8)}
              </div>
              <div className="text-sm text-gray-500">
                {format(
                  parseISO(session.events[0].timestamp),
                  "MMM dd, yyyy HH:mm"
                )}
              </div>
              <div className="text-sm text-gray-500">{session.domain}</div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                <span>{session.duration}</span>
                <span className="mx-2">•</span>
                <Monitor size={12} className="mr-1" />
                <span>{session.events[0].event_data.device}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Main content - Recording playback */}
        <div className="relative flex flex-1 flex-col">
          <div className="flex items-center justify-between bg-gray-800 p-2 text-white">
            <div>
              {selectedSession && (
                <div className="text-sm">
                  {selectedSession.domain}
                  {selectedSession.events[0].path.substring(0, 20)}...
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`rounded px-2 py-1 text-xs ${viewMode === "player" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => setViewMode("player")}
              >
                <LayoutGrid size={14} className="mr-1 inline" />
                Player
              </button>
              <button
                className={`rounded px-2 py-1 text-xs ${viewMode === "heatmap" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => setViewMode("heatmap")}
              >
                <Flame size={14} className="mr-1 inline" />
                Heatmap
              </button>
              <span className="ml-4 text-sm">
                {selectedSession &&
                  format(
                    parseISO(selectedSession.events[0].timestamp),
                    "MMM dd, yyyy HH:mm"
                  )}
              </span>
            </div>
          </div>

          <div
            className="flex flex-1 items-center justify-center overflow-hidden bg-gray-200"
            ref={playerContainerRef}
          >
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                  <p className="text-gray-500">Loading session data...</p>
                </div>
              </div>
            ) : selectedSession ? (
              <div className="relative">
                <div className="relative overflow-hidden bg-white shadow-lg">
                  {/* Main visualization */}
                  {viewMode === "player" ? (
                    <DOMVisualizer
                      session={selectedSession.events}
                      currentFrameIndex={currentFrameIndex}
                      mousePosition={mousePosition}
                      scrollPosition={scrollPosition}
                      settings={settings}
                    />
                  ) : (
                    <div
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        maxWidth: "100%",
                      }}
                    >
                      {/* Placeholder for webpage content in heatmap view */}
                      <div
                        className="h-full w-full bg-white opacity-70"
                        style={{ position: "relative" }}
                      >
                        {/* Sample content */}
                        <div className="p-4 text-center">
                          <h1 className="mb-4 text-2xl font-bold">
                            {selectedSession.domain}
                          </h1>
                          <p className="text-gray-700">Heatmap visualization</p>
                        </div>
                      </div>

                      {/* Overlay heatmap visualization */}
                      <HeatmapVisualizer
                        session={selectedSession.events}
                        width={width}
                        height={height}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Select a session to begin playback
              </div>
            )}
          </div>

          {/* Timeline */}
          {selectedSession && (
            <div className="bg-gray-100 p-2">
              <div className="relative mb-1 h-6 w-full overflow-hidden rounded-full bg-white">
                <div className="absolute top-0 left-0 h-full w-full">
                  {/* Event markers */}
                  {selectedSession.events.map((event, index) => {
                    const firstEventTime = new Date(
                      selectedSession.events[0].timestamp
                    ).getTime();
                    const eventTime = new Date(event.timestamp).getTime();
                    const position =
                      ((eventTime - firstEventTime) / (totalTime * 1000)) * 100;

                    // Only render if position is valid
                    if (position < 0 || position > 100) return null;

                    return (
                      <div
                        key={index}
                        className={`absolute h-full w-1 ${
                          event.event_name === "scroll"
                            ? "bg-amber-400"
                            : event.event_name === "mousemove"
                              ? "bg-blue-400"
                              : event.event_name === "click"
                                ? "bg-red-400"
                                : "bg-gray-400"
                        }`}
                        style={{ left: `${position}%` }}
                        title={`${event.event_name} at ${format(
                          parseISO(event.timestamp),
                          "HH:mm:ss.SSS"
                        )}`}
                        onClick={() => {
                          // Allow clicking on timeline markers to jump to that event
                          const eventSeconds =
                            (eventTime - firstEventTime) / 1000;
                          setCurrentTime(eventSeconds);
                          setCurrentFrameIndex(index);
                        }}
                      ></div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${totalTime > 0 ? (currentTime / totalTime) * 100 : 0}%`,
                    transition: isPlaying ? "none" : "width 0.1s ease-out",
                  }}
                ></div>

                {/* Scrubber */}
                <div
                  className="absolute top-0 h-full w-2 bg-blue-700"
                  style={{
                    left: `calc(${totalTime > 0 ? (currentTime / totalTime) * 100 : 0}% - 1px)`,
                    transition: isPlaying ? "none" : "left 0.1s ease-out",
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Playback controls */}
          {selectedSession && viewMode === "player" && (
            <div className="flex h-16 items-center border-t border-gray-200 bg-white px-4">
              <button
                className="mx-1 rounded-full p-2 hover:bg-gray-100"
                onClick={() => skip(-5)}
              >
                <SkipBack size={18} />
              </button>
              <button
                className="mx-1 rounded-full p-2 hover:bg-gray-100"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                className="mx-1 rounded-full p-2 hover:bg-gray-100"
                onClick={() => skip(5)}
              >
                <SkipForward size={18} />
              </button>

              <div className="mx-4 text-sm text-gray-500">
                {formatTime(currentTime)} / {formatTime(totalTime)}
              </div>

              <div className="mx-4 flex-1">
                <input
                  type="range"
                  min="0"
                  max={totalTime}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="rounded border p-1 text-sm text-gray-500"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar - Session info */}
      <div className="w-72 overflow-y-auto border-l border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-medium">Session Details</h2>
        </div>

        {selectedSession && stats && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center rounded border border-gray-200 p-3">
                <Eye size={16} />
                <div className="mt-2 font-bold">{stats.scrollEvents}</div>
                <div className="text-xs text-gray-500">Scroll Events</div>
              </div>

              <div className="flex flex-col items-center rounded border border-gray-200 p-3">
                <Clock size={16} />
                <div className="mt-2 font-bold">{formatTime(totalTime)}</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>

              <div className="flex flex-col items-center rounded border border-gray-200 p-3">
                <MousePointer size={16} />
                <div className="mt-2 font-bold">{stats.mouseEvents}</div>
                <div className="text-xs text-gray-500">Mouse Movements</div>
              </div>

              <div className="flex flex-col items-center rounded border border-gray-200 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 15-6-6h12a9 9 0 1 1-9 9v-3z" />
                </svg>
                <div className="mt-2 font-bold">{stats.clickEvents}</div>
                <div className="text-xs text-gray-500">Click Events</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 font-medium">User Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Browser:</span>
                  <span>
                    {stats.userInfo.browser?.name}{" "}
                    {stats.userInfo.browser?.version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span>
                    {stats.userInfo.timezone?.split("/")[1] || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span>{stats.userInfo.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Screen:</span>
                  <span>
                    {stats.userInfo.screenWidth} × {stats.userInfo.screenHeight}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span>{selectedSession.events[0].event_data.device}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referrer:</span>
                  <span>{stats.userInfo.referrer}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 font-medium">Current Event</h3>
              {currentFrameIndex < selectedSession.events.length && (
                <div className="rounded border border-gray-200 p-3">
                  <div className="font-medium">
                    {selectedSession.events[currentFrameIndex].event_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(
                      parseISO(
                        selectedSession.events[currentFrameIndex].timestamp
                      ),
                      "HH:mm:ss.SSS"
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    {selectedSession.events[currentFrameIndex].event_name ===
                      "scroll" && (
                      <div>
                        Scroll Position:{" "}
                        {Math.round(
                          selectedSession.events[currentFrameIndex].event_data
                            .scrollTop || 0
                        )}
                        px
                      </div>
                    )}
                    {selectedSession.events[currentFrameIndex].event_name ===
                      "mousemove" && (
                      <div>
                        Mouse Position: (
                        {selectedSession.events[currentFrameIndex].event_data.x}
                        ,{" "}
                        {selectedSession.events[currentFrameIndex].event_data.y}
                        )
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="mb-4 font-medium">Event Timeline</h3>
              <div className="max-h-64 space-y-2 overflow-y-auto text-sm">
                {selectedSession.events.map((event, idx) => (
                  <div
                    key={idx}
                    className={`rounded p-2 ${
                      currentFrameIndex === idx
                        ? "border-2 border-blue-500"
                        : ""
                    } ${
                      event.event_name === "scroll"
                        ? "bg-amber-50"
                        : event.event_name === "mousemove"
                          ? "bg-blue-50"
                          : event.event_name === "click"
                            ? "bg-red-50"
                            : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`font-medium ${
                          event.event_name === "scroll"
                            ? "text-amber-600"
                            : event.event_name === "mousemove"
                              ? "text-blue-600"
                              : event.event_name === "click"
                                ? "text-red-600"
                                : "text-gray-600"
                        }`}
                      >
                        {event.event_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(parseISO(event.timestamp), "HH:mm:ss.SSS")}
                      </span>
                    </div>
                    {event.event_name === "scroll" && (
                      <div className="mt-1 text-xs text-gray-600">
                        Scroll: {Math.round(event.event_data.scrollTop || 0)}px
                      </div>
                    )}
                    {event.event_name === "mousemove" && (
                      <div className="mt-1 text-xs text-gray-600">
                        Position: ({event.event_data.x}, {event.event_data.y})
                      </div>
                    )}
                    {event.event_name === "click" &&
                      event.event_data.elementDetails && (
                        <div className="mt-1 text-xs text-gray-600">
                          Clicked: {event.event_data.elementDetails.tagName}
                          {event.event_data.elementDetails.textContent &&
                            ` - "${event.event_data.elementDetails.textContent.substring(0, 20)}${
                              event.event_data.elementDetails.textContent
                                .length > 20
                                ? "..."
                                : ""
                            }"`}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
