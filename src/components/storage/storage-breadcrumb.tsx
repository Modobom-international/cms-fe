"use client";

import React from "react";

import { toast } from "sonner";

import { IBreadcrumbItem } from "@/types/storage.type";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
    <div className="bg-background mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.id}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {breadcrumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => handleBreadcrumbClick(index)}
                    className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors"
                  >
                    {breadcrumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

