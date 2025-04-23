import React from "react";

import { format } from "date-fns";

import { IUserTrackingSummary } from "@/types/user-tracking.type";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeatmapDialogProps {
  selectedRecord: IUserTrackingSummary | null;
}

export default function HeatmapDialog({ selectedRecord }: HeatmapDialogProps) {
  if (!selectedRecord) return null;

  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>Heatmap Visualization</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">UUID:</span>{" "}
            {selectedRecord.uuid || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Domain:</span>{" "}
            {selectedRecord.domain || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Total Events:</span>{" "}
            {selectedRecord.eventCount || "0"}
          </div>
        </div>

        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          <div className="relative aspect-video w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-center text-gray-500">
                Heatmap visualization for user interaction data:
                <br />
                User ID: {selectedRecord.uuid.substring(0, 8)}
                <br />
                Domain: {selectedRecord.domain}
                <br />
                Event Count: {selectedRecord.eventCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
