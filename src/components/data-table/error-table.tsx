import { FileWarning } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorTableProps {
  title?: string;
  description?: string;
  actionSection?: React.ReactNode;
}

export function ErrorTable({
  title,
  description,
  actionSection,
}: ErrorTableProps) {
  const t = useTranslations("ErrorTable");

  return (
    <div className="animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <section className="flex max-w-md flex-col items-start justify-start">
        <div className="bg-muted/50 text-muted-foreground flex h-12 w-12 items-center justify-center rounded-sm">
          <FileWarning className="text-muted-foreground h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title ?? t("title")}</h3>
        <p className="text-muted-foreground mt-2 text-left text-sm">
          {description ?? t("description")}
        </p>
        {actionSection}
      </section>
    </div>
  );
}

