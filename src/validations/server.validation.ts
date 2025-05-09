import { TranslationValues } from "next-intl";
import { z } from "zod";

export function CreateServerSchema(
  t: (key: string, values?: TranslationValues) => string
) {
  return z.object({
    name: z.string().min(1),
    ip: z
      .string()
      .min(1)
      .regex(/^(\d{1,3}\.){3}\d{1,3}$/),
  });
}

export type CreateServerFormType = z.infer<
  ReturnType<typeof CreateServerSchema>
>;

export function UpdateServerSchema(
  t: (key: string, values?: TranslationValues) => string
) {
  return CreateServerSchema(t).partial();
}

export type UpdateServerFormType = z.infer<
  ReturnType<typeof UpdateServerSchema>
>;
