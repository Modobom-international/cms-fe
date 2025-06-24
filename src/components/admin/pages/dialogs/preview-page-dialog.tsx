"use client";

import { useState } from "react";

import {
  Monitor,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Tablet,
  XIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface PreviewPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string;
  pageName: string;
}

type DevicePreset = {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelRatio: number;
  userAgent: string;
  type: "mobile" | "tablet" | "desktop";
  hasNotch?: boolean;
  hasHomeButton?: boolean;
};

type Orientation = "portrait" | "landscape";

const devicePresets: DevicePreset[] = [
  {
    id: "iphone-14-pro",
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    pixelRatio: 3,
    userAgent: "iPhone",
    type: "mobile",
    hasNotch: true,
  },
  {
    id: "iphone-se",
    name: "iPhone SE",
    width: 375,
    height: 667,
    pixelRatio: 2,
    userAgent: "iPhone",
    type: "mobile",
    hasHomeButton: true,
  },
  {
    id: "pixel-7",
    name: "Pixel 7",
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    userAgent: "Android",
    type: "mobile",
  },
  {
    id: "galaxy-s20-ultra",
    name: "Galaxy S20 Ultra",
    width: 412,
    height: 915,
    pixelRatio: 3.5,
    userAgent: "Android",
    type: "mobile",
  },
  {
    id: "ipad-air",
    name: "iPad Air",
    width: 820,
    height: 1180,
    pixelRatio: 2,
    userAgent: "iPad",
    type: "tablet",
  },
  {
    id: "ipad-mini",
    name: "iPad Mini",
    width: 768,
    height: 1024,
    pixelRatio: 2,
    userAgent: "iPad",
    type: "tablet",
  },
  {
    id: "surface-pro-7",
    name: "Surface Pro 7",
    width: 912,
    height: 1368,
    pixelRatio: 2,
    userAgent: "Windows",
    type: "tablet",
  },
  {
    id: "laptop",
    name: "Laptop",
    width: 1366,
    height: 768,
    pixelRatio: 1,
    userAgent: "Desktop",
    type: "desktop",
  },
  {
    id: "desktop",
    name: "Desktop",
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    userAgent: "Desktop",
    type: "desktop",
  },
];

const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export default function PreviewPageDialog({
  isOpen,
  onClose,
  previewUrl,
  pageName,
}: PreviewPageDialogProps) {
  const t = useTranslations("Studio.Sites.Pages");
  const [selectedDeviceId, setSelectedDeviceId] = useState("iphone-14-pro");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [zoom, setZoom] = useState(0.75);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedDevice =
    devicePresets.find((d) => d.id === selectedDeviceId) || devicePresets[0];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getDisplayDimensions = () => {
    if (selectedDevice.type === "desktop") {
      return { width: selectedDevice.width, height: selectedDevice.height };
    }

    return orientation === "portrait"
      ? { width: selectedDevice.width, height: selectedDevice.height }
      : { width: selectedDevice.height, height: selectedDevice.width };
  };

  const dimensions = getDisplayDimensions();
  const DeviceIcon = getDeviceIcon(selectedDevice.type);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const canRotate = selectedDevice.type !== "desktop";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-full max-h-[90vh] w-full !max-w-[90vw] bg-white p-0 [&>button]:hidden">
        {/* Enhanced Chrome DevTools Style Header */}
        <DialogHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3">
          <DialogTitle className="flex items-center justify-between text-sm">
            {/* Left Section - Device Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800">
                  Device:
                </span>
                <Select
                  value={selectedDeviceId}
                  onValueChange={setSelectedDeviceId}
                >
                  <SelectTrigger className="h-9 w-52 border-gray-300 bg-white text-sm shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 bg-white shadow-lg">
                    {devicePresets.map((device) => {
                      const Icon = getDeviceIcon(device.type);
                      return (
                        <SelectItem
                          key={device.id}
                          value={device.id}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{device.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-6 bg-gray-300" />

              {/* Dimensions and Info */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700"
                >
                  {dimensions.width} × {dimensions.height}
                </Badge>

                {selectedDevice.pixelRatio !== 1 && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 px-2 py-1 text-xs text-purple-700"
                  >
                    DPR: {selectedDevice.pixelRatio}
                  </Badge>
                )}

                <Badge
                  variant="outline"
                  className="border-gray-300 px-2 py-1 text-xs text-gray-600"
                >
                  {pageName}
                </Badge>
              </div>
            </div>

            {/* Right Section - Action Controls */}
            <div className="flex items-center gap-1">
              {/* Device Controls Group */}
              {canRotate && (
                <div className="flex items-center rounded-md border border-gray-200 bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOrientation(
                        orientation === "portrait" ? "landscape" : "portrait"
                      )
                    }
                    className="h-8 rounded-r-none border-0 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    title={`Switch to ${
                      orientation === "portrait" ? "landscape" : "portrait"
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Zoom Controls Group */}
              <div className="flex items-center rounded-md border border-gray-200 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                  disabled={zoom <= 0.25}
                  className="h-8 rounded-none border-0 px-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <Select
                  value={zoom.toString()}
                  onValueChange={(value) => setZoom(parseFloat(value))}
                >
                  <SelectTrigger className="h-8 w-20 rounded-none border-0 border-x border-gray-200 bg-white text-xs hover:bg-blue-50 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200">
                    {zoomLevels.map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {Math.round(level * 100)}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  disabled={zoom >= 2}
                  className="h-8 rounded-none border-0 px-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-8 rounded-md border border-gray-200 bg-white px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                title="Refresh preview"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-md border border-gray-200 bg-white px-3 text-gray-700 hover:bg-red-50 hover:text-red-700"
                onClick={onClose}
              >
                Close
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Enhanced Preview Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
          {previewUrl ? (
            <div
              className="flex h-full items-center justify-center"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                height: "calc(90vh - 60px)",
                width: "100%",
              }}
            >
              {/* Enhanced Device Frame */}
              <div className="relative">
                {selectedDevice.type !== "desktop" ? (
                  // Enhanced Mobile/Tablet Device Frame
                  <div
                    className="relative bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl"
                    style={{
                      width: dimensions.width + 32,
                      height:
                        dimensions.height +
                        (selectedDevice.hasHomeButton ? 72 : 56),
                      borderRadius:
                        selectedDevice.type === "mobile" ? "44px" : "28px",
                      padding: "16px",
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {/* Enhanced Device Details */}
                    {selectedDevice.hasNotch ? (
                      <div
                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-black"
                        style={{
                          width: "140px",
                          height: "28px",
                          borderRadius: "14px",
                        }}
                      />
                    ) : (
                      <div className="absolute top-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>
                        <div className="h-1 w-12 rounded-full bg-gray-500"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-500"></div>
                      </div>
                    )}

                    {/* Enhanced Screen with Subtle Inner Shadow */}
                    <div
                      className="relative overflow-hidden bg-white"
                      style={{
                        width: dimensions.width,
                        height: dimensions.height,
                        borderRadius:
                          selectedDevice.type === "mobile" ? "28px" : "20px",
                        marginTop: "16px",
                        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <iframe
                        key={`${selectedDeviceId}-${orientation}-${isRefreshing}`}
                        src={previewUrl}
                        className="h-full w-full border-0"
                        title={`Preview of ${pageName}`}
                        onError={() => {
                          console.error("Failed to load preview:", previewUrl);
                        }}
                      />
                    </div>

                    {/* Enhanced Home Button */}
                    {selectedDevice.hasHomeButton && (
                      <div
                        className="absolute bottom-5 left-1/2 -translate-x-1/2 border-2 border-gray-500 bg-gray-800"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "16px",
                        }}
                      />
                    )}
                  </div>
                ) : (
                  // Enhanced Desktop Frame
                  <div
                    className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl"
                    style={{
                      width: Math.min(
                        dimensions.width,
                        window.innerWidth * 0.75
                      ),
                      height: Math.min(
                        dimensions.height,
                        window.innerHeight * 0.65
                      ),
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Browser-like Top Bar */}
                    <div className="flex h-8 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="inline-flex h-5 items-center rounded border border-gray-200 bg-white px-3 text-xs text-gray-500">
                          {previewUrl}
                        </div>
                      </div>
                    </div>

                    <iframe
                      key={`${selectedDeviceId}-${isRefreshing}`}
                      src={previewUrl}
                      className="h-full w-full border-0"
                      style={{ height: "calc(100% - 32px)" }}
                      title={`Preview of ${pageName}`}
                      onError={() => {
                        console.error("Failed to load preview:", previewUrl);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-lg">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100">
                  <DeviceIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {t("PreviewExported")}
                </h3>
                <p className="max-w-sm text-sm text-gray-600">
                  {t("PreviewExportedDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
