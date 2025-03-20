import { getRequestConfig } from "next-intl/server";

import { getUserLocale } from "@/lib/locale";

export default getRequestConfig(async () => {
  // Get the user's locale from the cookie
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
