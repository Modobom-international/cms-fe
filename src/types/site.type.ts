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
  language: string;
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
      .string()
      .min(1, t("Validation.Language.Required"))
      .default("th"),
  });

export const UpdateSiteFormSchema = (t: any) =>
  z.object({
    language: z
      .string()
      .min(1, t("Validation.Language.Required"))
      .default("th"),
  });

export type SiteFormValues = z.infer<ReturnType<typeof SiteFormSchema>>;
export type UpdateSiteFormValues = z.infer<
  ReturnType<typeof UpdateSiteFormSchema>
>;

export type CreateSiteData = SiteFormValues;
export type UpdateSiteData = UpdateSiteFormValues;
