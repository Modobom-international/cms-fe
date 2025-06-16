import { z } from "zod";

export const CreateApiKeySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  expires_at: z.date().optional().nullable(),
});

export type ICreateApiKeyForm = z.infer<typeof CreateApiKeySchema>;

export const UpdateApiKeySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  is_active: z.boolean({
    message: "Status is required",
  }),
});

export type IUpdateApiKeyForm = z.infer<typeof UpdateApiKeySchema>;
