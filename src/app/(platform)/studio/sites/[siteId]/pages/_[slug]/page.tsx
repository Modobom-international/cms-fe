import Link from "next/link";

import WebBuilderStudio from "@/components/grapesjs-studio";

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
      <div className="bg-background flex items-center gap-4 border-b px-6 py-4">
        <Link
          href={`/studio/sites/${siteId}/pages`}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Pages
        </Link>
        <h1 className="text-2xl font-semibold">Editing: {slug}</h1>
      </div>
      <div className="relative flex-1">
        <WebBuilderStudio slug={slug} siteId={siteId} pageId={pageId} />
      </div>
    </div>
  );
}
