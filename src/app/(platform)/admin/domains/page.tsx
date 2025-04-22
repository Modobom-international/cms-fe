import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import DomainDataTable from "@/components/admin/domain/data-table";

export default function DomainPage() {
  const t = useTranslations("DomainPage");

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
              {t("pageHeader.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("pageHeader.description")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <DomainDataTable />
      </div>
    </div>
  );
}
