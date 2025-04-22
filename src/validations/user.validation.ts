import * as z from "zod";
import { TranslationValues } from "next-intl";

export function CreateUserFormSchema(
  t: (key: string, values?: TranslationValues) => string
) {
  return z.object({
    name: z.string().min(2, { message: t("validation.name.min") }),
    email: z
      .string()
      .min(1, { message: t("validation.email.required") })
      .email({ message: t("validation.email.invalid") }),
    password: z.string().min(8, { message: t("validation.password.min") }),
    team_id: z.string().min(1, { message: t("validation.team.required") }),
    permissions: z.record(z.boolean()).default({}),
  });
}

export function UpdateUserFormSchema(
  t: (key: string, values?: TranslationValues) => string
) {
  return z.object({
    name: z.string().min(2, { message: t("validation.name.min") }),
    email: z
      .string()
      .min(1, { message: t("validation.email.required") })
      .email({ message: t("validation.email.invalid") }),
    password: z
      .string()
      .min(8, { message: t("validation.password.min") })
      .optional(),
    team_id: z.string().min(1, { message: t("validation.team.required") }),
    permissions: z.record(z.boolean()).default({}),
  });
}

export type ICreateUserForm = z.infer<ReturnType<typeof CreateUserFormSchema>>;
export type IUpdateUserForm = z.infer<ReturnType<typeof UpdateUserFormSchema>>;
