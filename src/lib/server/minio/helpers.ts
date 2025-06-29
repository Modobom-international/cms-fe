import type internal from "stream";

import { MinioClient } from "./client";

export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await MinioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await MinioClient.makeBucket(bucketName);
  }
}

export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
}: {
  bucketName: string;
  fileName: string;
  file: Buffer | internal.Readable;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  // check if file exists
  const fileExists = await checkFileExistsInBucket({
    bucketName,
    fileName,
  });

  if (fileExists) {
    throw new Error("File already exists");
  }

  // Upload image to S3 bucket
  await MinioClient.putObject(bucketName, fileName, file);
}

export async function checkFileExistsInBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await MinioClient.statObject(bucketName, fileName);
  } catch {
    return false;
  }
  return true;
}

export async function getFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await MinioClient.statObject(bucketName, fileName);
  } catch (error) {
    console.error(error);
    return null;
  }
  return await MinioClient.getObject(bucketName, fileName);
}

export async function deleteFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  try {
    await MinioClient.removeObject(bucketName, fileName);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 0 means no expiry
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName);

  return await MinioClient.presignedPutObject(bucketName, fileName, expiry);
}

export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}) {
  return await MinioClient.presignedGetObject(bucketName, fileName, expiry);
}

export async function listObjectsInBucket({
  bucketName,
  prefix = "",
  recursive = false,
}: {
  bucketName: string;
  prefix?: string;
  recursive?: boolean;
}) {
  try {
    // Create bucket if it doesn't exist
    await createBucketIfNotExists(bucketName);

    const objects: any[] = [];
    const stream = MinioClient.listObjectsV2(bucketName, prefix, recursive);

    return new Promise((resolve, reject) => {
      stream.on("data", (obj) => {
        objects.push(obj);
      });
      stream.on("error", reject);
      stream.on("end", () => {
        resolve(objects);
      });
    });
  } catch (error) {
    console.error("Error listing objects:", error);
    throw error;
  }
}

export async function getFileStructure({
  bucketName,
  prefix = "",
}: {
  bucketName: string;
  prefix?: string;
}) {
  try {
    const stream = MinioClient.listObjectsV2(bucketName, prefix, false);
    const files: any[] = [];
    const foldersMap = new Map();
    const folderPromises: Promise<void>[] = [];

    for await (const obj of stream) {
      if (obj.prefix) {
        // This is a folder
        const folderName = obj.prefix.replace(prefix, "").replace(/\/$/, "");
        if (!foldersMap.has(folderName)) {
          const folderObject = {
            id: `folder-${obj.prefix}`,
            name: folderName,
            type: "folder",
            size: 0,
            modifiedDate: new Date().toISOString(), // Folders don't have a mod date
            owner: "System",
            path: obj.prefix,
            itemCount: 0, // Placeholder, will be updated by promise
            mimeType: "folder",
          };
          foldersMap.set(folderName, folderObject);

          // Create a promise to count items in this folder
          const countPromise = (async () => {
            const countStream = MinioClient.listObjectsV2(
              bucketName,
              obj.prefix,
              false
            );
            let count = 0;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of countStream) {
              count++;
            }
            folderObject.itemCount = count;
          })();
          folderPromises.push(countPromise);
        }
      } else if (obj.name) {
        // This is a file
        const fileName = obj.name.replace(prefix, "");
        if (fileName) {
          // Check if it's not the folder itself placeholder
          const presignedUrl = await createPresignedUrlToDownload({
            bucketName,
            fileName: obj.name,
          });
          files.push({
            id: `file-${obj.name}`,
            name: fileName,
            type: "file",
            size: obj.size,
            modifiedDate: obj.lastModified,
            owner: "System",
            path: obj.name,
            downloadUrl: presignedUrl,
            mimeType: getMimeType(fileName),
          });
        }
      }
    }

    await Promise.all(folderPromises);
    const folders = Array.from(foldersMap.values());

    return { files, folders };
  } catch (error) {
    console.error("Error fetching file structure:", error);
    throw new Error("Failed to retrieve file structure from storage.");
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text
    txt: "text/plain",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    ts: "application/typescript",
    // Archives
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    // Video
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

