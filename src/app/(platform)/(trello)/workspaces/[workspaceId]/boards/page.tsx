"use client";

import { use } from "react";

import Link from "next/link";

import { Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGetWorkspace } from "@/hooks/workspace";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import BoardsClient from "@/components/board/BoardsClient";

export default function BoardsPage({
  params,
}: {
  params: Promise<{
    workspaceId: string;
  }>;
}) {
  const { workspaceId } = use(params);
  const t = useTranslations("Workspace");

  // Convert workspaceId to number and fetch workspace data
  const workspaceIdNumber = parseInt(workspaceId);
  const { workspace, isLoading } = useGetWorkspace(workspaceIdNumber);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/workspaces" asChild>
                <Link href="/workspaces">{t("title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isLoading ? t("boards") : workspace?.name || t("boards")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isLoading ? t("boards") : `${workspace?.name} - ${t("boards")}`}
          </h2>
        </div>
      </div>
      <BoardsClient workspaceId={workspaceId} />
    </div>
  );
}

