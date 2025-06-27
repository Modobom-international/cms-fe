"use client";

import { useState } from "react";

import { useStorageStore } from "@/stores/storage/useStorageStore";
import {
  Copy,
  Download,
  Edit2,
  MoreHorizontal,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { ShareFileDialog } from "@/components/storage/share-file-dialog";

export function FloatingToolbar() {
  const { selectedItems } = useStorageStore();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleAction = (action: string) => {
    const count = selectedItems.length;
    switch (action) {
      case "download":
        toast.success(`Downloading ${count} item(s)`);
        break;
      case "share":
        if (selectedItems.length === 1) {
          setShareDialogOpen(true);
        } else {
          toast.success(`Shared ${count} item(s)`);
        }
        break;
      case "delete":
        toast.success(`Deleted ${count} item(s)`);
        break;
      case "copy":
        toast.success(`Copied ${count} item(s)`);
        break;
      case "move":
        toast.success(`Moving ${count} item(s)`);
        break;
      case "star":
        toast.success(`Starred ${count} item(s)`);
        break;
      case "rename":
        toast.info("Rename functionality");
        break;
    }
  };

  // Get the first selected item for the share dialog
  const selectedItem = selectedItems[0]
    ? { name: "Document.pdf", type: "file" as const }
    : { name: "", type: "file" as const };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      {/* Main Toolbar */}
      <div className="border-border bg-background/95 dark:bg-background/95 flex items-center gap-2 rounded-full border px-4 py-3 shadow-2xl backdrop-blur-sm">
        {/* Selection Info */}
        <div className="mr-2 flex items-center gap-2">
          <div className="bg-primary/10 dark:bg-primary/20 flex h-7 w-7 items-center justify-center rounded-full">
            <span className="text-primary text-xs font-semibold">
              {selectedItems.length}
            </span>
          </div>
          <span className="text-foreground hidden text-sm font-medium sm:block">
            {selectedItems.length === 1
              ? "1 item"
              : `${selectedItems.length} items`}
          </span>
        </div>

        <Separator orientation="vertical" className="bg-border h-6" />

        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("download")}
            className="hover:bg-muted/50 dark:hover:bg-muted/30 h-8 w-8 p-0"
            title="Download"
          >
            <Download className="text-muted-foreground hover:text-foreground h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("share")}
            className="hover:bg-muted/50 dark:hover:bg-muted/30 h-8 w-8 p-0"
            title="Share"
          >
            <Share2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
          </Button>

          {selectedItems.length === 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("rename")}
              className="hover:bg-muted/50 dark:hover:bg-muted/30 h-8 w-8 p-0"
              title="Rename"
            >
              <Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("copy")}
            className="hover:bg-muted/50 dark:hover:bg-muted/30 h-8 w-8 p-0"
            title="Copy"
          >
            <Copy className="text-muted-foreground hover:text-foreground h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("star")}
            className="hover:bg-muted/50 dark:hover:bg-muted/30 h-8 w-8 p-0"
            title="Star"
          >
            <Star className="text-muted-foreground hover:text-foreground h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="bg-border h-6" />

        {/* More Actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-muted/50 dark:hover:bg-muted/30 h-8 w-8 p-0"
              title="More actions"
            >
              <MoreHorizontal className="text-muted-foreground hover:text-foreground h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-background dark:bg-background border-border w-48 p-2"
            align="center"
            side="top"
          >
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("delete")}
                className="text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive w-full justify-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Share Dialog */}
      <ShareFileDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        fileName={selectedItem.name}
        fileType={selectedItem.type}
      />
    </div>
  );
}

