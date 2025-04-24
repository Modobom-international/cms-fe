"use client";

import { useEffect, useRef } from "react";

import { IUserTrackingData } from "@/types/user-tracking.type";

interface HeatmapVisualizerProps {
  session: IUserTrackingData[] | null;
  width: number;
  height: number;
}

export function HeatmapVisualizer({
  session,
  width,
  height,
}: HeatmapVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate heatmap data from tracking events
  useEffect(() => {
    if (!canvasRef.current || !session || session.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Extract mouse events
    const mouseEvents = session.filter(
      (event) =>
        event.event_name === "mousemove" &&
        event.event_data.x !== undefined &&
        event.event_data.y !== undefined
    );

    // Extract click events
    const clickEvents = session.filter(
      (event) =>
        event.event_name === "click" &&
        event.event_data.x !== undefined &&
        event.event_data.y !== undefined
    );

    // Draw heatmap for mouse movements (blue gradient)
    mouseEvents.forEach((event) => {
      if (
        event.event_data.x !== undefined &&
        event.event_data.y !== undefined
      ) {
        const x = event.event_data.x;
        const y = event.event_data.y;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw heatmap for clicks (red gradient)
    clickEvents.forEach((event) => {
      if (
        event.event_data.x !== undefined &&
        event.event_data.y !== undefined
      ) {
        const x = event.event_data.x;
        const y = event.event_data.y;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.7)");
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [session, width, height]);

  if (!session || session.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <p className="text-gray-500">No data available for heatmap</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="pointer-events-none absolute top-0 left-0 z-50"
        style={{ opacity: 0.7 }}
      />
    </div>
  );
}
