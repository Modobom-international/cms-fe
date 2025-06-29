import type {
  FileInDBProp,
  PresignedUrlProp,
  ShortFileProp,
} from "@/lib/server/minio/types";

import {
  checkFileExistsInBucket,
  createBucketIfNotExists,
  createPresignedUrlToDownload,
  createPresignedUrlToUpload,
  deleteFileFromBucket,
  getFileFromBucket,
  getFileStructure,
  listObjectsInBucket,
  saveFileInBucket,
} from "./helpers";

export type { ShortFileProp, PresignedUrlProp, FileInDBProp };

export {
  saveFileInBucket,
  checkFileExistsInBucket,
  getFileFromBucket,
  deleteFileFromBucket,
  createPresignedUrlToUpload,
  createPresignedUrlToDownload,
  listObjectsInBucket,
  getFileStructure,
};
