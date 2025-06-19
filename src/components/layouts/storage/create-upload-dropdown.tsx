"use client";

import { Files, FolderPlus, Plus, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreateUploadDropdownProps {
  onCreateFolder?: () => void;
  onUploadFile?: () => void;
  onUploadFolder?: () => void;
  className?: string;
}

export function CreateUploadDropdown({
  onCreateFolder,
  onUploadFile,
  onUploadFolder,
  className,
}: CreateUploadDropdownProps) {
  return (
    <div className={cn("mb-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-primary/25 hover:shadow-primary/30 relative h-10 w-32 justify-start gap-4 overflow-hidden rounded-full border-0 bg-gradient-to-br px-5 font-semibold shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 opacity-0 transition-opacity duration-300" />
            <div className="relative flex size-5 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all duration-300">
              <Plus className="h-4 w-4 transition-transform duration-300" />
            </div>
            <span className="relative text-sm font-medium tracking-wide">
              New
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-background/80 border-border w-72 rounded-2xl border shadow-2xl backdrop-blur-xl"
          sideOffset={12}
        >
          <DropdownMenuItem
            onClick={onCreateFolder}
            className="group hover:bg-primary/10 h-12 cursor-pointer rounded-lg px-4 transition-colors duration-150"
          >
            <div className="bg-primary/20 group-hover:bg-primary/30 mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
              <FolderPlus className="text-primary size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                Create folder
              </span>
              <span className="text-muted-foreground text-xs">
                New folder to organize files
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onUploadFile}
            className="group hover:bg-primary/10 h-12 cursor-pointer rounded-lg px-4 transition-colors duration-150"
          >
            <div className="bg-primary/20 group-hover:bg-primary/30 mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
              <Upload className="text-primary size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                Upload file
              </span>
              <span className="text-muted-foreground text-xs">
                Upload from your device
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onUploadFolder}
            className="group hover:bg-primary/10 h-12 cursor-pointer rounded-lg px-4 transition-colors duration-150"
          >
            <div className="bg-primary/20 group-hover:bg-primary/30 mr-3 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
              <Files className="text-primary size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                Upload folder
              </span>
              <span className="text-muted-foreground text-xs">
                Upload entire folder structure
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
