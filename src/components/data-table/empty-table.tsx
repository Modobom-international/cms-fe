import { Database, FileBarChart2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function EmptyTable({
  title,
  description,
  onRefresh,
}: {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}) {
  const t = useTranslations("EmptyTable");

  return (
    <div className="animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <Database className="text-primary h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title ?? t("title")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        {description ?? t("description")}
      </p>
      <div className="mt-6 flex gap-3">
        {onRefresh && (
          <Button
            onClick={onRefresh}
            className="inline-flex items-center"
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refreshButton")}
          </Button>
        )}
        <Button className="inline-flex items-center" size="sm">
          <FileBarChart2 className="mr-2 h-4 w-4" />
          {t("viewReportsButton")}
        </Button>
      </div>
    </div>
  );
}
