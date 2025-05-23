import Link from "next/link";

import { ChevronRight, Home, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";

import TeamsDataTable from "@/components/admin/teams/data-table";

export default function TeamsPage() {
  const t = useTranslations("TeamPage");
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>{t("breadcrumb")}</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("description")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              {t("employees")}
            </Link>
            <Link
              href="/admin/teams/create"
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("addTeam")}
            </Link>
          </div>
        </div>
      </div>

      <div>
        <TeamsDataTable />
      </div>
    </div>
  );
}
