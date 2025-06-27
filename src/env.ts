import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MINIO_ENDPOINT: z.string().min(1).default("localhost"),
    MINIO_SSL: z.string().default("false"),
    MINIO_PORT: z.string().default("9000"),
    MINIO_ACCESS_KEY: z.string().min(1).default("minioadmin"),
    MINIO_SECRET_KEY: z.string().min(1).default("minioadmin"),
    MINIO_BUCKET_NAME: z.string().min(1).default("test"),
  },
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_GRAPESJS_LICENSE_KEY: z.string(),
    NEXT_PUBLIC_REVERB_APP_KEY: z.string().min(1).default("default-app-key"),
    NEXT_PUBLIC_REVERB_APP_ID: z.string().min(1).default("default-app-id"),
    NEXT_PUBLIC_REVERB_HOST: z.string().min(1).default("api.modobomco.com"),
    NEXT_PUBLIC_REVERB_PORT: z.string().default("6004"),
    NEXT_PUBLIC_REVERB_SCHEME: z.enum(["http", "https"]).default("https"),
    NEXT_PUBLIC_BUCKET_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_BUCKET_NAME: z.string().min(1),
    NEXT_PUBLIC_R2_ACCOUNT_ID: z.string().min(1),
    NEXT_PUBLIC_R2_ACCESS_KEY_ID: z.string().min(1),
    NEXT_PUBLIC_R2_SECRET_ACCESS_KEY: z.string().min(1),
    NEXT_PUBLIC_R2_ENDPOINT: z.string().url(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_SSL: process.env.MINIO_SSL,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_GRAPESJS_LICENSE_KEY:
      process.env.NEXT_PUBLIC_GRAPESJS_LICENSE_KEY,
    NEXT_PUBLIC_REVERB_APP_KEY: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    NEXT_PUBLIC_REVERB_APP_ID: process.env.NEXT_PUBLIC_REVERB_APP_ID,
    NEXT_PUBLIC_REVERB_HOST: process.env.NEXT_PUBLIC_REVERB_HOST,
    NEXT_PUBLIC_REVERB_PORT: process.env.NEXT_PUBLIC_REVERB_PORT,
    NEXT_PUBLIC_REVERB_SCHEME: process.env.NEXT_PUBLIC_REVERB_SCHEME,
    NEXT_PUBLIC_BUCKET_PUBLIC_URL: process.env.NEXT_PUBLIC_BUCKET_PUBLIC_URL,
    NEXT_PUBLIC_BUCKET_NAME: process.env.NEXT_PUBLIC_BUCKET_NAME,
    NEXT_PUBLIC_R2_ACCOUNT_ID: process.env.NEXT_PUBLIC_R2_ACCOUNT_ID,
    NEXT_PUBLIC_R2_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID,
    NEXT_PUBLIC_R2_SECRET_ACCESS_KEY:
      process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_R2_ENDPOINT: process.env.NEXT_PUBLIC_R2_ENDPOINT,
  },
});
