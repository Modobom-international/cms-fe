"use client";

import Link from "next/link";

import { useTranslations } from "next-intl";

interface EditorHeaderProps {
  slug: string;
  siteId: string;
}

export default function EditorHeader({ slug, siteId }: EditorHeaderProps) {
  const t = useTranslations("Editor");

  return (
    <div className="bg-background flex items-center gap-4 border-b px-6 py-4">
      <Link
        href={`/studio/sites/${siteId}/pages`}
        className="text-muted-foreground hover:text-foreground"
      >
        ← {t("BackToPages")}
      </Link>
      <h1 className="text-2xl font-semibold">{t("Editing", { slug })}</h1>
    </div>
  );
}
