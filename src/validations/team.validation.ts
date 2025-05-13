import { z } from "zod";

export const TeamFormSchema = z.object({
  name: z.string().min(1, "Tên phòng ban không được để trống"),
  permissions: z.record(z.string(), z.boolean()),
});

export type ITeamForm = z.infer<typeof TeamFormSchema>;
