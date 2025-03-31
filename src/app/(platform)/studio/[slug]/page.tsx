import React from "react";

import WebBuilderStudio from "@/components/grapesjs-studio";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="h-screen w-screen">
      <WebBuilderStudio slug={slug} />
    </div>
  );
}

// Generate static params for common pages
export async function generateStaticParams() {
  return [{ slug: "home" }, { slug: "about" }, { slug: "contact" }];
}
