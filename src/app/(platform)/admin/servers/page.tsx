import { ChevronRight, Home, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";

import ServerDataTable from "@/components/admin/servers/data-table";
import AddServerDialog from "@/components/admin/servers/dialogs/add-server-dialog";

export default function ServerPage() {
  const t = useTranslations("ServerPage");

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

          <AddServerDialog
            trigger={
              <div
                className={buttonVariants({
                  variant: "default",
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addServer")}
              </div>
            }
          />
        </div>
      </div>

      <div>
        <ServerDataTable />
      </div>
    </div>
  );
}
