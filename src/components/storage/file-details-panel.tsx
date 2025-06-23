"use client";

import React, { useState } from "react";

import { sampleFiles, sampleFolders } from "@/data/storage";
import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  File,
  Files,
  FileText,
  Folder,
  HardDrive,
  MapPin,
  MousePointer,
  Share2,
  Star,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock activity data
const mockActivity = [
  {
    id: "1",
    action: "modified",
    user: "John Doe",
    timestamp: "2024-01-15 14:30",
    icon: Edit,
    description: "Modified file content",
  },
  {
    id: "2",
    action: "viewed",
    user: "Jane Smith",
    timestamp: "2024-01-15 10:15",
    icon: Eye,
    description: "Viewed file",
  },
  {
    id: "3",
    action: "shared",
    user: "John Doe",
    timestamp: "2024-01-14 16:45",
    icon: Share2,
    description: "Shared with team members",
  },
  {
    id: "4",
    action: "starred",
    user: "Alice Johnson",
    timestamp: "2024-01-14 09:20",
    icon: Star,
    description: "Added to starred items",
  },
  {
    id: "5",
    action: "created",
    user: "John Doe",
    timestamp: "2024-01-13 11:30",
    icon: FileText,
    description: "Created file",
  },
];

export function FileDetailsPanel() {
  const { selectedItems, showDetailsPanel } = useStorageStore();
  const [activeTab, setActiveTab] = useState("details");

  // Get selected item details
  const allItems = [...sampleFolders, ...sampleFiles];
  const selectedItem =
    selectedItems.length === 1
      ? allItems.find((item) => item.id === selectedItems[0])
      : null;

  if (!showDetailsPanel) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "modified":
        return "text-blue-600 dark:text-blue-400";
      case "viewed":
        return "text-green-600 dark:text-green-400";
      case "shared":
        return "text-purple-600 dark:text-purple-400";
      case "starred":
        return "text-yellow-600 dark:text-yellow-400";
      case "created":
        return "text-primary dark:text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const getFileIcon = (item: any) => {
    if (item.type === "folder") {
      return <Folder className="h-10 w-10 text-blue-500 dark:text-blue-400" />;
    }

    // Different icons based on file type
    const mimeType = item.mimeType?.toLowerCase() || "";
    if (mimeType.includes("image")) {
      return <File className="h-10 w-10 text-green-500 dark:text-green-400" />;
    } else if (mimeType.includes("pdf")) {
      return <File className="h-10 w-10 text-red-500 dark:text-red-400" />;
    } else if (mimeType.includes("document") || mimeType.includes("text")) {
      return (
        <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      );
    }

    return <File className="h-10 w-10 text-gray-500 dark:text-gray-400" />;
  };

  // No items selected
  if (selectedItems.length === 0) {
    return (
      <div className="border-border bg-background dark:bg-background flex h-full w-80 flex-col border-l">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="space-y-4 text-center">
            <div className="bg-muted/30 dark:bg-muted/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
              <MousePointer className="text-muted-foreground h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-foreground font-semibold">No selection</h3>
              <p className="text-muted-foreground max-w-48 text-sm">
                Select a file or folder to see details
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple items selected
  if (selectedItems.length > 1) {
    return (
      <div className="border-border bg-background dark:bg-background flex h-full w-80 flex-col border-l">
        <div className="p-6 pb-4">
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="bg-muted/30 dark:bg-muted/20 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Files className="text-primary h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-base leading-tight font-semibold">
                {selectedItems.length} items selected
              </h3>
              <p className="text-muted-foreground text-sm">
                Multiple items selected
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Basic Information for Multiple Items */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Files className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm">Items</span>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {selectedItems.length} selected
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <HardDrive className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      Total size
                    </span>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    Calculating...
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Actions for Multiple Items */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="text-muted-foreground h-4 w-4" />
                <h4 className="text-foreground text-sm font-semibold">
                  Available Actions
                </h4>
              </div>
              <div className="ml-6 space-y-2">
                <p className="text-muted-foreground text-sm">
                  You can download, share, or delete these items using the
                  floating toolbar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single item selected - show full details
  if (!selectedItem) {
    return null;
  }

  return (
    <div className="border-border bg-background dark:bg-background flex h-full w-80 flex-col border-l">
      {/* File Preview Header */}
      <div className="p-6 pb-4">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="bg-muted/30 dark:bg-muted/20 flex h-16 w-16 items-center justify-center rounded-2xl">
            {getFileIcon(selectedItem)}
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground text-base leading-tight font-semibold">
              {selectedItem.name}
            </h3>
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <span className="capitalize">{selectedItem.type}</span>
              {selectedItem.shared && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span>Shared</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-1 flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col"
        >
          <div className="px-6 pb-4">
            <TabsList className="bg-muted/20 dark:bg-muted/10 grid h-9 w-full grid-cols-2 p-1">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-background text-sm font-medium data-[state=active]:shadow-sm"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-background text-sm font-medium data-[state=active]:shadow-sm"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="mt-0 flex-1 px-6">
            <ScrollArea className="h-full">
              <div className="space-y-6 pb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <HardDrive className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          Size
                        </span>
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {selectedItem.type === "folder"
                          ? `${(selectedItem as any).itemCount} items`
                          : formatFileSize(selectedItem.size)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          Modified
                        </span>
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {selectedItem.modifiedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <User className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          Owner
                        </span>
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {selectedItem.owner}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          Type
                        </span>
                      </div>
                      <span className="text-foreground text-sm font-medium capitalize">
                        {selectedItem.type}
                        {selectedItem.type === "file" &&
                          selectedItem.mimeType && (
                            <span className="text-muted-foreground ml-1 text-xs">
                              ({selectedItem.mimeType})
                            </span>
                          )}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-foreground text-sm font-semibold">
                      Location
                    </h4>
                  </div>
                  <div className="ml-6">
                    <div className="bg-muted/20 dark:bg-muted/10 rounded-lg px-3 py-2">
                      <p className="text-muted-foreground font-mono text-sm">
                        /Home/Documents/Projects/Current Folder
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Sharing & Access */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-foreground text-sm font-semibold">
                      Access
                    </h4>
                  </div>
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Visibility
                      </span>
                      <Badge
                        variant={selectedItem.shared ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          selectedItem.shared
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                        )}
                      >
                        {selectedItem.shared ? "Shared" : "Private"}
                      </Badge>
                    </div>
                    {selectedItem.shared && (
                      <div className="text-muted-foreground text-sm">
                        3 people have access
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activity" className="mt-0 flex-1 px-6">
            <ScrollArea className="h-full">
              <div className="pb-6">
                <div className="space-y-4">
                  {mockActivity.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="group flex items-start gap-3"
                      >
                        <div className="bg-muted/20 dark:bg-muted/10 group-hover:bg-muted/30 dark:group-hover:bg-muted/20 flex h-8 w-8 items-center justify-center rounded-full transition-colors">
                          <IconComponent
                            className={cn(
                              "h-4 w-4",
                              getActionColor(activity.action)
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground text-sm font-medium capitalize">
                              {activity.action}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              by {activity.user}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-1">
                            <Clock className="text-muted-foreground h-3 w-3" />
                            <span className="text-muted-foreground text-xs">
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
