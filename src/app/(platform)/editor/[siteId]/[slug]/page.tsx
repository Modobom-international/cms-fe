
import WebBuilderStudio from "@/components/grapesjs-studio";
import EditorHeader from "@/components/editor/EditorHeader";

export default async function PageEditor({
  params,
  searchParams,
}: {
  params: Promise<{
    slug: string;
    siteId: string;
  }>;
  searchParams: Promise<{
    pageId: string;
  }>;
}) {
  const { slug, siteId } = await params;
  const { pageId } = await searchParams;

  return (
    <div className="flex h-screen w-screen flex-col">
      <EditorHeader slug={slug} siteId={siteId} />
      <div className="relative flex-1">
        <WebBuilderStudio slug={slug} siteId={siteId} pageId={pageId} />
      </div>
    </div>
  );
}

