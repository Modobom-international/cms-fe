"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditorHeaderProps {
  slug: string;
  siteId: string;
}

export default function EditorHeader({ slug, siteId }: EditorHeaderProps) {
  const t = useTranslations("Editor");

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 border-b backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/studio/sites/${siteId}/pages`}
            className="text-muted-foreground hover:text-foreground hover:bg-accent hover:bg-opacity-50 group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("BackToPages")}
          </Link>
          <div className="bg-border/60 h-6 w-px" />
          <div className="flex flex-col">
            <h1 className="text-foreground text-xl font-semibold tracking-tight">
              {t("Editing", { slug })}
            </h1>
            <p className="text-muted-foreground/80 text-sm">
              Make your changes and save when ready
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
