"use client";

import { useState } from "react";

import { ArrowLeft, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useDeployPage } from "@/hooks/pages";

import { Button } from "../ui/button";

interface EditorHeaderProps {
  slug: string;
  siteId: string;
  onPreviewClick: () => void;
}

export default function EditorHeader({
  slug,
  siteId,
  onPreviewClick,
}: EditorHeaderProps) {
  const t = useTranslations("Editor");
  const [tempDisabled, setTempDisabled] = useState(false);

  // React Query hook for deploy
  const deployPageMutation = useDeployPage();

  const handleBackToPages = () => {
    window.location.href = `/studio/sites/${siteId}/pages`;
  };

  const handleDeploy = async () => {
    // Temporarily disable the button for 3 seconds
    setTempDisabled(true);
    setTimeout(() => {
      setTempDisabled(false);
    }, 3000);

    try {
      await toast.promise(
        deployPageMutation.mutateAsync({
          site_id: Number(siteId),
          page_slugs: [slug],
        }),
        {
          loading: "Deploying page...",
          success: "Deploy completed successfully!",
          error: (err) =>
            `Deploy failed: ${err instanceof Error ? err.message : "Please try again"}`,
        }
      );
    } catch (error) {
      console.error("Deploy error:", error);
    }
  };

  const isDisabled = tempDisabled || deployPageMutation.isPending;
  const buttonText = deployPageMutation.isPending
    ? "Deploying..."
    : tempDisabled
      ? "Deploy Page"
      : "Deploy Page";

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 border-b backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToPages}
            className="text-muted-foreground hover:text-foreground hover:bg-accent hover:bg-opacity-50 group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("BackToPages")}
          </button>
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

        {/* Button Group */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50"
            onClick={onPreviewClick}
          >
            Preview Exported
          </Button>

          <button
            onClick={handleDeploy}
            disabled={isDisabled}
            className={`group inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
              isDisabled
                ? "cursor-not-allowed bg-gray-400 text-white opacity-60"
                : "bg-green-600 text-white shadow-sm hover:-translate-y-0.5 hover:scale-105 hover:bg-green-700 hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-800/50"
            } ${deployPageMutation.isPending ? "animate-pulse" : ""} `}
            title={
              isDisabled
                ? tempDisabled
                  ? "Please wait 3 seconds before clicking again"
                  : "Deploy in progress"
                : "Deploy your changes to make them live"
            }
          >
            <Rocket
              className={`h-4 w-4 transition-transform duration-200 ${deployPageMutation.isPending ? "animate-spin" : "group-hover:rotate-12"}`}
            />
            {buttonText}
          </button>
        </div>
      </div>
    </header>
  );
}

