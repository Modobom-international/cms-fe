import { NextRequest, NextResponse } from "next/server";

import { getFileStructure } from "@/lib/server/minio";

const bucketName = process.env.MINIO_BUCKET_NAME!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";

    // Get file structure from MinIO
    const fileStructure = await getFileStructure({
      bucketName,
      prefix,
    });

    return NextResponse.json(fileStructure);
  } catch (error) {
    console.error("Error fetching file structure:", error);
    return NextResponse.json(
      { error: "Failed to fetch file structure" },
      { status: 500 }
    );
  }
}
