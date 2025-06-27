import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
  LANGUAGES,
} from "@/constants/languages";
import {
  DEFAULT_PLATFORM,
  PLATFORMS,
  type PlatformValue,
} from "@/constants/platform";
import { z } from "zod";

export interface Site {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  cloudflare_project_name: string;
  cloudflare_domain_status: string;
  branch: string;
  created_at: string;
  updated_at: string;
  status: string;
  language: LanguageCode;
  platform: PlatformValue;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    type_user: string;
    profile_photo_path: string | null;
    exclude_token: string | null;
  };
}

export const SiteFormSchema = (t: any) =>
  z.object({
    name: z
      .string()
      .min(1, t("Validation.Name.Required"))
      .min(3, t("Validation.Name.MinLength"))
      .max(64, t("Validation.Name.MaxLength"))
      .regex(/^[a-zA-Z0-9\s\-_]+$/, t("Validation.Name.InvalidCharacters"))
      .transform((value) => value.trim()),
    domain: z
      .string()
      .min(1, t("Validation.Domain.Required"))
      .min(3, t("Validation.Domain.MinLength"))
      .max(253, t("Validation.Domain.MaxLength"))
      .regex(
        /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
        t("Validation.Domain.Invalid")
      ),
    language: z
      .enum(LANGUAGES.map((l) => l.code) as [string, ...string[]], {
        errorMap: () => ({ message: t("Validation.Language.Invalid") }),
      })
      .default(DEFAULT_LANGUAGE),
    platform: z
      .enum(PLATFORMS.map((p) => p.value) as [string, ...string[]], {
        errorMap: () => ({ message: t("Validation.Platform.Invalid") }),
      })
      .default(DEFAULT_PLATFORM),
  });

export const UpdateSiteFormSchema = (t: any) =>
  z.object({
    language: z
      .enum(LANGUAGES.map((l) => l.code) as [string, ...string[]], {
        errorMap: () => ({ message: t("Validation.Language.Invalid") }),
      })
      .default(DEFAULT_LANGUAGE),
    platform: z
      .enum(PLATFORMS.map((p) => p.value) as [string, ...string[]], {
        errorMap: () => ({ message: t("Validation.Platform.Invalid") }),
      })
      .optional(),
  });

export const UpdateSitePlatformSchema = (t: any) =>
  z.object({
    platform: z.enum(PLATFORMS.map((p) => p.value) as [string, ...string[]], {
      errorMap: () => ({ message: t("Validation.Platform.Invalid") }),
    }),
  });

export const UpdateSiteLanguageSchema = (t: any) =>
  z.object({
    language: z.enum(LANGUAGES.map((l) => l.code) as [string, ...string[]], {
      errorMap: () => ({ message: t("Validation.Language.Invalid") }),
    }),
  });

export type SiteFormValues = z.infer<ReturnType<typeof SiteFormSchema>>;
export type UpdateSiteFormValues = z.infer<
  ReturnType<typeof UpdateSiteFormSchema>
>;
export type UpdateSitePlatformValues = z.infer<
  ReturnType<typeof UpdateSitePlatformSchema>
>;
export type UpdateSiteLanguageValues = z.infer<
  ReturnType<typeof UpdateSiteLanguageSchema>
>;

export type CreateSiteData = SiteFormValues;
export type UpdateSiteData = UpdateSiteFormValues;
export type UpdateSitePlatformData = UpdateSitePlatformValues;
export type UpdateSiteLanguageData = UpdateSiteLanguageValues;
