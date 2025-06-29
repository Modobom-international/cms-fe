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
    // Get objects with both recursive and non-recursive to catch everything
    const [objects, recursiveObjects] = await Promise.all([
      listObjectsInBucket({ bucketName, prefix, recursive: false }) as Promise<
        any[]
      >,
      listObjectsInBucket({ bucketName, prefix, recursive: true }) as Promise<
        any[]
      >,
    ]);

    const folders = new Map<string, any>();
    const files: any[] = [];
    const processedPaths = new Set<string>();

    // First, identify all unique folder paths from recursive listing
    recursiveObjects.forEach((obj) => {
      const objectName = obj.name;
      if (objectName === prefix) return;

      const relativePath = prefix ? objectName.replace(prefix, "") : objectName;
      if (!relativePath) return;

      const pathParts = relativePath.split("/").filter(Boolean);

      // If this object is nested, create folder entries for all parent directories
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderPath = pathParts.slice(0, i + 1).join("/");
        const folderName = pathParts[i];
        const fullFolderPath = prefix + folderPath + "/";

        if (!processedPaths.has(fullFolderPath) && !folders.has(folderName)) {
          processedPaths.add(fullFolderPath);
          folders.set(folderName, {
            id: `folder-${folderName}-${Date.now()}-${Math.random()}`,
            name: folderName,
            type: "folder",
            size: 0,
            modifiedDate: obj.lastModified || new Date().toISOString(),
            createdDate: obj.lastModified || new Date().toISOString(),
            owner: "System",
            shared: false,
            mimeType: "folder",
            path: fullFolderPath,
            parentId: prefix || "root",
            itemCount: 0,
          });
        }
      }
    });

    // Then process the non-recursive objects for current level items
    const filePromises: Promise<any>[] = [];

    objects.forEach((obj) => {
      const objectName = obj.name;
      if (objectName === prefix) return;

      const relativePath = prefix ? objectName.replace(prefix, "") : objectName;
      if (!relativePath) return;

      // Handle explicit folder markers (objects ending with /)
      if (relativePath.endsWith("/")) {
        const folderName = relativePath.slice(0, -1);
        const folderParts = folderName.split("/");
        const immediateFolder = folderParts[0];

        if (immediateFolder && !folders.has(immediateFolder)) {
          folders.set(immediateFolder, {
            id: `folder-${immediateFolder}-${Date.now()}-${Math.random()}`,
            name: immediateFolder,
            type: "folder",
            size: 0,
            modifiedDate: obj.lastModified || new Date().toISOString(),
            createdDate: obj.lastModified || new Date().toISOString(),
            owner: "System",
            shared: false,
            mimeType: "folder",
            path: prefix + immediateFolder + "/",
            parentId: prefix || "root",
            itemCount: 0,
          });
        }
        return;
      }

      const pathParts = relativePath.split("/").filter(Boolean);
      if (pathParts.length === 0) return;

      if (pathParts.length === 1) {
        // This is a file in the current directory
        const fileName = pathParts[0];
        if (fileName.endsWith("/")) return;

        // Create promise for generating presigned URL
        const filePromise = createPresignedUrlToDownload({
          bucketName,
          fileName: objectName,
          expiry: 60 * 60, // 1 hour
        }).then((presignedUrl) => ({
          id: `file-${objectName}-${Date.now()}-${Math.random()}`,
          name: fileName,
          type: "file",
          size: obj.size || 0,
          modifiedDate: obj.lastModified || new Date().toISOString(),
          createdDate: obj.lastModified || new Date().toISOString(),
          owner: "System",
          shared: false,
          mimeType: getMimeType(fileName),
          path: prefix + fileName,
          parentId: prefix || "root",
          downloadUrl: presignedUrl,
          previewUrl: isImageFile(fileName) ? presignedUrl : undefined,
        }));

        filePromises.push(filePromise);
      }
    });

    // Wait for all presigned URLs to be generated
    const resolvedFiles = await Promise.all(filePromises);
    files.push(...resolvedFiles);

    // Count items in folders from recursive listing
    recursiveObjects.forEach((obj) => {
      const objectName = obj.name;
      if (objectName === prefix || objectName.endsWith("/")) return;

      const relativePath = prefix ? objectName.replace(prefix, "") : objectName;
      if (!relativePath) return;

      const pathParts = relativePath.split("/").filter(Boolean);
      if (pathParts.length > 1) {
        const folderName = pathParts[0];
        if (folders.has(folderName)) {
          const folder = folders.get(folderName);
          folder.itemCount += 1;
          folder.size += obj.size || 0;
        }
      }
    });

    const result = {
      folders: Array.from(folders.values()),
      files,
    };

    return result;
  } catch (error) {
    console.error("Error getting file structure:", error);
    throw error;
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

function isImageFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
  ];
  return imageExtensions.includes(ext || "");
}
