import React from "react";

import WebBuilderStudio from "@/components/grapesjs-studio";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Page({ params }: PageProps) {
  const { slug } = params;

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
