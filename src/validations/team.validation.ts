import { z } from "zod";

// Types
export interface PermissionRoute {
  id: number;
  name: string;
  prefix: string;
}

export interface Permission {
  [key: string]: PermissionRoute[];
}

// Team form schema for validation
export const TeamFormSchema = z.object({
  name: z.string().min(1, "Tên phòng ban không được để trống"),
  permissions: z.record(z.string(), z.boolean()),
});

export type ITeamForm = z.infer<typeof TeamFormSchema>;

// Default permissions object structure
export const defaultPermissions: Permission = {
  "push-system": [
    { id: 1, name: "push.view", prefix: "push" },
    { id: 2, name: "push.create", prefix: "push" },
    { id: 3, name: "push.edit", prefix: "push" },
    { id: 4, name: "push.delete", prefix: "push" },
  ],
  "log-behavior": [
    { id: 5, name: "log.view", prefix: "log" },
    { id: 6, name: "log.export", prefix: "log" },
    { id: 7, name: "log.delete", prefix: "log" },
  ],
  users: [
    { id: 8, name: "users.view", prefix: "users" },
    { id: 9, name: "users.create", prefix: "users" },
    { id: 10, name: "users.edit", prefix: "users" },
    { id: 11, name: "users.delete", prefix: "users" },
  ],
  domain: [
    { id: 12, name: "domain.view", prefix: "domain" },
    { id: 13, name: "domain.create", prefix: "domain" },
    { id: 14, name: "domain.edit", prefix: "domain" },
    { id: 15, name: "domain.delete", prefix: "domain" },
  ],
  "html-source": [
    { id: 16, name: "html.view", prefix: "html" },
    { id: 17, name: "html.create", prefix: "html" },
    { id: 18, name: "html.edit", prefix: "html" },
    { id: 19, name: "html.delete", prefix: "html" },
  ],
  "users-tracking": [
    { id: 20, name: "tracking.view", prefix: "tracking" },
    { id: 21, name: "tracking.export", prefix: "tracking" },
    { id: 22, name: "tracking.delete", prefix: "tracking" },
  ],
  team: [
    { id: 23, name: "team.view", prefix: "team" },
    { id: 24, name: "team.create", prefix: "team" },
    { id: 25, name: "team.edit", prefix: "team" },
    { id: 26, name: "team.delete", prefix: "team" },
  ],
};
