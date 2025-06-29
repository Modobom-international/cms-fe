export const LANGUAGES = [
  {
    code: "ro",
    name: "Romanian",
    flag: "🇷🇴",
    color: "red",
  },
  {
    code: "th",
    name: "Thai",
    flag: "🇹🇭",
    color: "blue",
  },
  {
    code: "cr",
    name: "Croatian",
    flag: "🇭🇷",
    color: "red",
  },
  {
    code: "ms",
    name: "Malaysian",
    flag: "🇲🇾",
    color: "yellow",
  },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "th";

export const getLanguageInfo = (languageCode: LanguageCode) => {
  return LANGUAGES.find((lang) => lang.code === languageCode) || LANGUAGES[0];
};
