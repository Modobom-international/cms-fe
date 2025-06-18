import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import SitesDataTable from "@/components/admin/sites/data-table";
import CreateSiteDialog from "@/components/admin/sites/data-table/create-site-dialog";

export default function SitesManagementPage() {
  const t = useTranslations("Studio.Sites");

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>{t("Title")}</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {t("Title")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("Description")}</p>
          </div>

          <CreateSiteDialog />
        </div>
      </div>

      <div>
        <SitesDataTable />
      </div>
    </div>
  );
}

