import { z } from "zod";

export interface ITeamForm {
  name: string;
  permissions: Record<string, boolean>;
}

export const TeamFormSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  permissions: z.record(z.string(), z.boolean()),
});
