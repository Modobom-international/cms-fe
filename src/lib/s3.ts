import { env } from "@/env";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

// Configure S3 client for Cloudflare R2
const getS3Config = (): S3ClientConfig => {
  return {
    region: "auto",
    endpoint: env.NEXT_PUBLIC_R2_ENDPOINT,
    credentials: {
      accessKeyId: env.NEXT_PUBLIC_R2_ACCESS_KEY_ID,
      secretAccessKey: env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY,
      accountId: env.NEXT_PUBLIC_R2_ACCOUNT_ID,
    },
  };
};

// Create and export the S3 client
export const s3Client = new S3Client(getS3Config());

// Export bucket name for reuse
export const bucketName = env.NEXT_PUBLIC_BUCKET_NAME;

// Helper to generate API URL for objects (to avoid CORS issues)
export const getApiUrl = (key: string): string => {
  return `/api/r2?key=${encodeURIComponent(key)}`;
};

export const bucketPublicUrl = env.NEXT_PUBLIC_BUCKET_PUBLIC_URL;
