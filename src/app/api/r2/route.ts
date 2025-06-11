import { NextRequest, NextResponse } from "next/server";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import { bucketName, bucketPublicUrl, s3Client } from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const prefix = searchParams.get("prefix");

    // Handle listing objects if prefix is provided
    if (prefix) {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });

      const listResult = await s3Client.send(command);

      if (!listResult.Contents) {
        return NextResponse.json({ items: [] });
      }

      // Process each item without making additional API calls
      const items = listResult.Contents.map((item) => {
        if (!item.Key) return null;

        // Get the file name from the full path
        const fileName = item.Key.split("/").pop() || "";

        // Extract timestamp from filename if present
        let timestamp = 0;
        const timestampMatch = fileName.match(/-(\d+)\./);
        if (timestampMatch && timestampMatch[1]) {
          timestamp = parseInt(timestampMatch[1], 10);
        }

        return {
          key: item.Key,
          name: fileName, // Use filename directly
          size: item.Size,
          lastModified: item.LastModified,
          timestamp: timestamp,
          url: `${bucketPublicUrl}/${item.Key}`,
        };
      });

      // Filter out null items and sort by timestamp
      const validItems = items.filter((item) => item !== null);
      validItems.sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));

      return NextResponse.json({ items: validItems });
    }

    // Handle single file retrieval if key is provided
    if (!key) {
      return NextResponse.json(
        { error: "Key or prefix is required" },
        { status: 400 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return the file with appropriate content type
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file || !key) {
      return NextResponse.json(
        { error: "File and key are required" },
        { status: 400 }
      );
    }

    // Use Buffer.from with Uint8Array for compatibility and cast to any to satisfy type checker
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer)) as any;
    const mimeType = file.type;
    let uploadBuffer = buffer;
    let uploadContentType = mimeType;
    let uploadKey = key;

    // Only process if it's an image (not GIF)
    if (mimeType.startsWith("image/") && mimeType !== "image/gif") {
      try {
        // Convert to webp using sharp
        const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        uploadBuffer = webpBuffer;
        uploadContentType = "image/webp";
        // Change file extension to .webp
        uploadKey = key.replace(/\.[^.]+$/, ".webp");
      } catch (err) {
        console.error(
          "Sharp image conversion failed, uploading original:",
          err
        );
      }
    }
    // GIFs and non-images are uploaded as-is

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uploadKey,
        Body: uploadBuffer,
        ContentType: uploadContentType,
        Metadata: {
          originalName: file.name,
        },
      })
    );

    // Return the direct public URL for better performance
    const fileUrl = `${bucketPublicUrl}/${uploadKey}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading asset:", error);
    return NextResponse.json(
      { error: "Failed to upload asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
