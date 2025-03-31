import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_GRAPESJS_LICENSE_KEY: z.string(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_GRAPESJS_LICENSE_KEY: process.env.GRAPESJS_LICENSE_KEY,
  },
});
