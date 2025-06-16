import { IPermission } from "@/types/permission.type";
import { ITeam } from "@/types/team.type";

export interface PermissionRoute {
  id: string;
  name: string;
  prefix: string;
}

export interface Permission {
  [key: string]: PermissionRoute[];
}

export interface TeamPermissionResponse {
  success: boolean;
  data: {
    teams: ITeam[];
    permissions: IPermission[];
  };

  message: string;
  type: string;
  error?: string;
}
