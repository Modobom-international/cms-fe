import { NextResponse } from "next/server";

import type { PresignedUrlProp, ShortFileProp } from "@/lib/server/minio";
import { createPresignedUrlToUpload } from "@/lib/server/minio";

const bucketName = process.env.MINIO_BUCKET_NAME!;
const expiry = 60 * 60; // 1 hour

// Function to sanitize filename for MinIO/S3 while preserving structure
function sanitizeFilename(filename: string): string {
  // Split path and filename to handle folder structures
  const pathParts = filename.split("/");

  return pathParts
    .map((part) => {
      // Don't sanitize empty parts (for leading slashes)
      if (!part) return part;

      // Replace unsafe characters with underscores, but preserve folder separators
      return part
        .replace(/[<>:"|?*\x00-\x1f]/g, "_") // Remove unsafe characters (but keep forward slash)
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/_{2,}/g, "_") // Replace multiple underscores with single
        .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
    })
    .join("/");
}

export async function POST(req: Request) {
  try {
    // get the files from the request body
    const body = await req.json();
    const files = body as ShortFileProp[];

    if (!files?.length) {
      return new NextResponse("No files to upload", { status: 400 });
    }

    const presignedUrls = [] as PresignedUrlProp[];

    if (files?.length) {
      // use Promise.all to get all the presigned urls in parallel
      await Promise.all(
        // loop through the files
        files.map(async (file) => {
          // Use original filename but sanitize it for safety
          const fileName = sanitizeFilename(file.originalFileName);

          // get presigned url using s3 sdk
          const url = await createPresignedUrlToUpload({
            bucketName,
            fileName,
            expiry,
          });

          // add presigned url to the list
          presignedUrls.push({
            fileNameInBucket: fileName,
            originalFileName: file.originalFileName,
            fileSize: file.fileSize,
            url,
          });
        })
      );
    }

    const publicUrls = presignedUrls.map((presignedUrl) => {
      const publicUrl = `http${process.env.MINIO_SSL === "true" ? "s" : ""}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${presignedUrl.fileNameInBucket}`;
      return { ...presignedUrl, publicUrl };
    });

    return NextResponse.json(publicUrls);
  } catch (error) {
    console.error({ error });
    return new NextResponse("Internal error", { status: 500 });
  }
}
