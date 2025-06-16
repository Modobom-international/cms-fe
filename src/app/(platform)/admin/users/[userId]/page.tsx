import Link from "next/link";

import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";

import EditUserForm from "@/components/admin/users/create-user-form";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const t = await getTranslations("UpdateUserPage");

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>User Management</span>
          <ChevronRight className="h-4 w-4" />
          <span>{t("breadcrumb")}</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>

          <Link
            href="/admin/users"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("actions.backToList")}
          </Link>
        </div>
      </div>

      {/* Client Component Form */}
      <EditUserForm userId={userId} />
    </div>
  );
}
