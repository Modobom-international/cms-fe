import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { readdir, readFile } from "fs/promises";
import path from "path";

import { getUserLocale } from "@/lib/locale";

async function loadMessages(locale: string) {
  const localePath = path.join(process.cwd(), "messages", locale);

  try {
    const fileNames = await readdir(localePath);
    const messages = {};

    for (const fileName of fileNames) {
      if (fileName.endsWith(".json")) {
        const filePath = path.join(localePath, fileName);
        const fileContent = await readFile(filePath, "utf8");
        Object.assign(messages, JSON.parse(fileContent));
      }
    }

    return messages;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(
        `[next-intl] Could not find messages for locale "${locale}" in "${localePath}".`,
      );
      notFound();
    }

    throw error;
  }
}

export default getRequestConfig(async () => {
  // Get the user's locale from the cookie
  const locale = await getUserLocale();

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
