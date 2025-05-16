import Link from "next/link";

import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import BoardClient from "@/components/board/BoardClient";

export default async function BoardPage({
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
              <BreadcrumbPage className="text-foreground">
                {t("board")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <BoardClient boardId={Number(boardId)} />
    </div>
  );
}

