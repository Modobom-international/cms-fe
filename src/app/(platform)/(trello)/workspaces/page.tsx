import { Suspense } from "react";

import { Home } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

import { WorkspaceList } from "@/components/workspace/WorkspaceList";

export default function WorkspacesPage() {
  const t = useTranslations("Workspace");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Home className="h-4 w-4" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("breadcrumb")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <WorkspaceList />
      </Suspense>
    </div>
  );
}
