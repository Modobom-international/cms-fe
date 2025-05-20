import Link from "next/link";

import { Home } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import BoardMembersClient from "@/components/board/BoardMembersClient";

export default async function BoardMembersPage({
  params,
}: {
  params: Promise<{
    workspaceId: string;
    boardId: string;
  }>;
}) {
  const { boardId, workspaceId } = await params;
  const t = await getTranslations("Workspace");

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
                  {t("boards")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/workspaces/${workspaceId}/boards/${boardId}`}
                asChild
              >
                <Link
                  href={`/workspaces/${workspaceId}/boards/${boardId}`}
                  className="text-foreground hover:text-primary"
                >
                  {t("board")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground">
                {t("members")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <BoardMembersClient boardId={Number(boardId)} workspaceId={workspaceId} />
    </div>
  );
}
