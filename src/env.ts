import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_GRAPESJS_LICENSE_KEY: z.string(),
    NEXT_PUBLIC_REVERB_APP_KEY: z.string().min(1).default("default-app-key"),
    NEXT_PUBLIC_REVERB_APP_ID: z.string().min(1).default("default-app-id"),
    NEXT_PUBLIC_REVERB_HOST: z.string().min(1).default("localhost"),
    NEXT_PUBLIC_REVERB_PORT: z.string().default("8080"),
    NEXT_PUBLIC_REVERB_SCHEME: z.enum(["http", "https"]).default("http"),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_GRAPESJS_LICENSE_KEY:
      process.env.NEXT_PUBLIC_GRAPESJS_LICENSE_KEY,
    NEXT_PUBLIC_REVERB_APP_KEY: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    NEXT_PUBLIC_REVERB_APP_ID: process.env.NEXT_PUBLIC_REVERB_APP_ID,
    NEXT_PUBLIC_REVERB_HOST: process.env.NEXT_PUBLIC_REVERB_HOST,
    NEXT_PUBLIC_REVERB_PORT: process.env.NEXT_PUBLIC_REVERB_PORT,
    NEXT_PUBLIC_REVERB_SCHEME: process.env.NEXT_PUBLIC_REVERB_SCHEME,
  },
});
