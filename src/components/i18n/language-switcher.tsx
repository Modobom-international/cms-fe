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
        className="focus:ring-primary flex h-9 w-auto items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 focus:ring-2 focus:outline-none"
        aria-label="Select language"
      >
        {selectedLanguage && (
          <div className="flex items-center gap-2">
            <img
              src={selectedLanguage.flag}
              alt={selectedLanguage.label}
              className="h-5 w-5"
            />
            <span>{selectedLanguage.label}</span>
          </div>
        )}
        {isPending && (
          <svg
            className="text-muted-foreground ml-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
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
        )}
      </SelectTrigger>
      <SelectContent
        align="end"
        className="w-[180px] rounded-md border border-gray-300 bg-white shadow-lg"
      >
        <SelectGroup>
          {LANGUAGES.map(({ value, label, flag }) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <img src={flag} alt={label} className="h-5 w-5" />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
