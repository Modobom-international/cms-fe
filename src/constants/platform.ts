export const PLATFORMS = [
  { value: "google", label: "Google", icon: "🔍", color: "blue" },
  { value: "facebook", label: "Facebook", icon: "📘", color: "indigo" },
  { value: "tiktok", label: "TikTok", icon: "🎵", color: "pink" },
] as const;

export type PlatformValue = (typeof PLATFORMS)[number]["value"];

export const DEFAULT_PLATFORM: PlatformValue = "google";

export const getPlatformInfo = (platform: PlatformValue) => {
  return PLATFORMS.find((p) => p.value === platform) || PLATFORMS[0];
};
