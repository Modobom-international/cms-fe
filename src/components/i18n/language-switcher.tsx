"use client";

import { useTransition } from "react";

import { Locale } from "@/i18n/config";
import { useLocale } from "next-intl";

import { setUserLocale } from "@/lib/locale";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LanguageOption = {
  value: Locale;
  label: string;
  flag: string;
};

const LANGUAGES = [
  {
    value: "en",
    label: "English",
    flag: "/img/flags/GB.svg",
  },
  {
    value: "vi",
    label: "Tiếng Việt",
    flag: "/img/flags/VN.svg",
  },
] satisfies LanguageOption[];

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const selectedLanguage = LANGUAGES.find((lang) => lang.value === locale);

  const handleLanguageChange = (value: Locale) => {
    startTransition(async () => {
      setUserLocale(value as Locale);
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
        className="focus-visible:ring-ring/20 dark:focus-visible:ring-ring/40 hover:bg-accent/50 dark:hover:bg-accent/30 border-border bg-background text-foreground flex h-9 w-auto min-w-[140px] items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Select language"
      >
        {selectedLanguage && !isPending && (
          <div className="flex items-center gap-2">
            <img
              src={selectedLanguage.flag}
              alt={selectedLanguage.label}
              className="h-5 w-5 rounded-sm"
              loading="lazy"
            />
            <span className="truncate">{selectedLanguage.label}</span>
          </div>
        )}
        {isPending && (
          <div className="flex items-center gap-2">
            <div className="bg-muted h-5 w-5 animate-pulse rounded-sm" />
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            <svg
              className="text-muted-foreground ml-auto h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        )}
      </SelectTrigger>
      <SelectContent
        align="end"
        className="border-border bg-popover text-popover-foreground w-[180px] rounded-md border shadow-lg"
        sideOffset={4}
      >
        <SelectGroup>
          {LANGUAGES.map(({ value, label, flag }) => (
            <SelectItem
              key={value}
              value={value}
              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-sm transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <img
                  src={flag}
                  alt={label}
                  className="h-5 w-5 rounded-sm"
                  loading="lazy"
                />
                <span className="font-medium">{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
