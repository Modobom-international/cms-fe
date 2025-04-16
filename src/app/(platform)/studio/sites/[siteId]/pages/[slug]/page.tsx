import Link from "next/link";

import WebBuilderStudio from "@/components/grapesjs-studio";

export default async function PageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; siteId: string }>;
  searchParams: { pageId: string };
}) {
  const { slug, siteId } = await params;
  const { pageId } = await searchParams;
  console.log("Page ID:", pageId);

  return (
    <div className="relative h-screen">
      <div className="absolute top-0 right-0 left-0 z-10 bg-white px-6 py-4 shadow-md">
        <Link
          href={`/studio/sites/${siteId}/pages`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Pages
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Editing: {slug}</h1>
      </div>
      <div className="h-full pt-24">
        <WebBuilderStudio slug={slug} siteId={siteId} pageId={pageId} />
      </div>
    </div>
  );
}
