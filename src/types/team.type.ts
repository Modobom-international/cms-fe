export interface ITeam {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface ITeamResponse {
  success: true;
  data: IPaginationResponse<ITeam>;
  message?: string;
  type?: string;
}

export interface IPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ITeamWithPermissionResponse {
  success: true;
  data: ITeam[];
  message?: string;
  type?: string;
}

export interface CreateTeamResponse {
  success: boolean;
  message: string;
  type: string;
}

export interface GetTeamResponse {
  success: true;
  data: ITeam;
  message?: string;
  type?: string;
}

export interface BackendErrorRes {
  success: false;
  message: string;
  type: string;
}

export type GetTeamByIdResponse = GetTeamResponse | BackendErrorRes;
