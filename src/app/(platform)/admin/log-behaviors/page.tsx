import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import LogBehaviorDataTable from "@/components/admin/log-behavior/data-table";

export default function LogBehaviorPage() {
  const t = useTranslations("LogBehaviorPage");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>{t("breadcrumb")}</span>
        </nav>

        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("pageHeader.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("pageHeader.description")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <LogBehaviorDataTable />
      </div>
    </div>
  );
}
