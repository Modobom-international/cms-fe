"use client";

import { use } from "react";

import Link from "next/link";

import { Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGetBoards } from "@/hooks/board/board";
import { useGetWorkspace } from "@/hooks/workspace";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import BoardClient from "@/components/board/BoardClient";

export default function BoardPage({
  params,
}: {
  params: Promise<{
    workspaceId: string;
    boardId: string;
  }>;
}) {
  const { boardId, workspaceId } = use(params);
  const t = useTranslations("Workspace");

  // Convert IDs to numbers and fetch data
  const workspaceIdNumber = parseInt(workspaceId);
  const boardIdNumber = parseInt(boardId);

  const { workspace, isLoading: isLoadingWorkspace } =
    useGetWorkspace(workspaceIdNumber);
  const { boards, isLoading: isLoadingBoards } = useGetBoards(workspaceId);

  // Find the specific board
  const board = boards?.find((b) => b.id === boardIdNumber);
  const isLoading = isLoadingWorkspace || isLoadingBoards;

  return (
    <div className="flex flex-col space-y-4">
      <div className="px-8 pt-6">
        <Breadcrumb className="relative z-10">
          <BreadcrumbList className="text-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" asChild>
                <Link href="/" className="text-foreground hover:text-primary">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/workspaces" asChild>
                <Link
                  href="/workspaces"
                  className="text-foreground hover:text-primary"
                >
                  {t("title")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/workspaces/${workspaceId}/boards`}
                asChild
              >
                <Link
                  href={`/workspaces/${workspaceId}/boards`}
                  className="text-foreground hover:text-primary"
                >
                  {isLoading ? t("boards") : workspace?.name || t("boards")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground">
                {isLoading ? t("board") : board?.name || t("board")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <BoardClient boardId={Number(boardId)} boardName={board?.name} />
    </div>
  );
}

