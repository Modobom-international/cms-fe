import { Metadata } from "next";

export function constructMetadata({
  title = {
    default: "Modobom CMS",
    template: "%s | Modobom CMS",
  },
  description = "",
  image = "/img/logo-modobom-resize-dark.png",
  icons = "/img/logo.png",
}: {
  title?: {
    default: string;
    template: string;
  };
  description?: string;
  image?: string;
  icons?: string;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: title.default,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: title.default,
      description,
      images: [image],
      creator: "@Modobom",
    },
    icons,
    metadataBase: new URL("http://localhost:3000/"),
  };
}
