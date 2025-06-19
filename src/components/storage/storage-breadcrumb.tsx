"use client";

import React from "react";

import { FolderOpen, Home } from "lucide-react";
import { toast } from "sonner";

import { IBreadcrumbItem } from "@/types/storage.type";

import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem as UIBreadcrumbItem,
} from "@/components/ui/breadcrumb";

interface StorageBreadcrumbProps {
  breadcrumbs: IBreadcrumbItem[];
}

export function StorageBreadcrumb({ breadcrumbs }: StorageBreadcrumbProps) {
  const handleBreadcrumbClick = (index: number) => {
    const breadcrumb = breadcrumbs[index];
    toast.info(`Navigating to ${breadcrumb.name}...`);
  };

  return (
    <div className="fixed top-16 z-50 w-full border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.id}>
              {index > 0 && <BreadcrumbSeparator />}
              <UIBreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {index === 0 ? (
                      <Home className="h-4 w-4" />
                    ) : (
                      <FolderOpen className="h-4 w-4" />
                    )}
                    {breadcrumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => handleBreadcrumbClick(index)}
                    className="flex cursor-pointer items-center gap-1 transition-colors hover:text-blue-600"
                  >
                    {index === 0 ? (
                      <Home className="h-4 w-4" />
                    ) : (
                      <FolderOpen className="h-4 w-4" />
                    )}
                    {breadcrumb.name}
                  </BreadcrumbLink>
                )}
              </UIBreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
