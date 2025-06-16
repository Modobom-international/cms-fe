import { ChevronRight, Home, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";

import ApiKeyDataTable from "@/components/admin/api-keys/data-table";
import CreateApiKeyDialog from "@/components/admin/api-keys/dialogs/create-api-key-dialog";

export default function ApiKeyPage() {
  const t = useTranslations("ApiKeyPage");

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

          <CreateApiKeyDialog
            trigger={
              <div
                className={buttonVariants({
                  variant: "default",
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addApiKey")}
              </div>
            }
          />
        </div>
      </div>

      <div>
        <ApiKeyDataTable />
      </div>
    </div>
  );
}
