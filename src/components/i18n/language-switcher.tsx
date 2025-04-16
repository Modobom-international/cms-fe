"use client";

import { useTransition } from "react";

import { usePathname, useRouter } from "next/navigation";

import { type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { setUserLocale } from "@/lib/locale";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LanguageOption = {
  value: Locale;
  label: string;
  flag: JSX.Element;
};

/**
 * Available language configurations with flag representations
 */
const LANGUAGES = [
  {
    value: "en",
    label: "English",
    flag: (
      <div className="relative h-4 w-6 overflow-hidden rounded-sm">
        <div className="absolute inset-0 bg-blue-700" />
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            {/* Union Jack pattern */}
            <div className="absolute inset-0 border-r-[1px] border-white">
              <div className="absolute top-0 left-0 h-[50%] w-[40%] bg-white">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-red-600">
                    <div className="absolute top-0 left-[20%] h-full w-[20%] bg-white" />
                    <div className="absolute top-[40%] left-0 h-[20%] w-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    value: "vi",
    label: "Tiếng Việt",
    flag: (
      <div className="relative h-4 w-6 overflow-hidden rounded-sm">
        <div className="absolute inset-0 bg-red-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 text-yellow-300">★</div>
        </div>
      </div>
    ),
  },
] satisfies LanguageOption[];

/**
 * Language switcher component with flag representations
 * Implements a select dropdown with language options
 */
export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  /**
   * Handles language change and updates the application state
   * @param newLocale - The new locale to switch to
   */
  const handleLanguageChange = (newLocale: Locale) => {
    // Early return if same language or already in transition
    if (newLocale === locale || isPending) return;

    startTransition(async () => {
      try {
        // Update locale in cookie and server state
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        await setUserLocale(newLocale);

        router.refresh();
      } catch (error) {
        console.error("Failed to switch language:", error);
      }
    });
  };

  return (
    <Select
      defaultValue={locale}
      value={locale}
      onValueChange={handleLanguageChange}
      disabled={isPending}
    >
      <SelectTrigger
        className="hover:bg-accent h-9 w-9 border-0 bg-transparent p-0 shadow-none"
        aria-label="Select language"
      >
        <SelectValue
          placeholder={
            <Globe className="text-muted-foreground mx-auto h-5 w-5" />
          }
        >
          <Globe className="text-muted-foreground mx-auto h-5 w-5" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[150px]">
        {LANGUAGES.map(({ value, label, flag }) => (
          <SelectItem
            key={value}
            value={value}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              {flag}
              <span>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
