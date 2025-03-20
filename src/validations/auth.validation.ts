import * as z from "zod";
import { TranslationValues } from "next-intl";

export function LoginFormSchema(
  t: (key: string, values?: TranslationValues) => string
) {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("validation.email.required") })
      .email({ message: t("validation.email.invalid") }),
    password: z
      .string()
      .min(1, { message: t("validation.password.required") })
      .min(6, { message: t("validation.password.min") }),
    remember: z.boolean().optional(),
  });
}

export type ILoginForm = z.infer<ReturnType<typeof LoginFormSchema>>;
