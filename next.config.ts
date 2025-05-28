import { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "cms.modobom.test",
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

