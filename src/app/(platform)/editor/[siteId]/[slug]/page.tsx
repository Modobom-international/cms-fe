"use client";

import React, { useState } from "react";

import { env } from "@/env";

import { useGetSiteById } from "@/hooks/sites";

import PreviewPageDialog from "@/components/admin/pages/dialogs/preview-page-dialog";
import EditorHeader from "@/components/editor/EditorHeader";
import WebBuilderStudio from "@/components/grapesjs-studio";

interface PageEditorProps {
  params: Promise<{
    slug: string;
    siteId: string;
  }>;
  searchParams: Promise<{
    pageId: string;
  }>;
}

export default function PageEditor({ params, searchParams }: PageEditorProps) {
  const [slug, setSlug] = useState<string>("");
  const [siteId, setSiteId] = useState<string>("");
  const [pageId, setPageId] = useState<string>("");
  const [previewDialogState, setPreviewDialogState] = useState({
    isOpen: false,
    previewUrl: "",
    pageName: "",
  });

  // Get site data for preview URL
  const { data: site } = useGetSiteById(siteId);

  // Resolve params and searchParams
  React.useEffect(() => {
    params.then(({ slug, siteId }) => {
      setSlug(slug);
      setSiteId(siteId);
    });
    searchParams.then(({ pageId }) => {
      setPageId(pageId);
    });
  }, [params, searchParams]);

  const handlePreviewClick = () => {
    if (site?.data?.name) {
      setPreviewDialogState({
        isOpen: true,
        previewUrl: `${env.NEXT_PUBLIC_BACKEND_URL}/storage/exports/${site.data.name}/${slug}/index.html`,
        pageName: slug,
      });
    }
  };

  if (!slug || !siteId || !pageId) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex h-screen w-screen flex-col">
        <EditorHeader
          slug={slug}
          siteId={siteId}
          onPreviewClick={handlePreviewClick}
        />
        <div className="relative flex-1">
          <WebBuilderStudio slug={slug} siteId={siteId} pageId={pageId} />
        </div>
      </div>
      <PreviewPageDialog
        isOpen={previewDialogState.isOpen}
        onClose={() =>
          setPreviewDialogState({
            isOpen: false,
            previewUrl: "",
            pageName: "",
          })
        }
        previewUrl={previewDialogState.previewUrl}
        pageName={previewDialogState.pageName}
      />
    </>
  );
}
