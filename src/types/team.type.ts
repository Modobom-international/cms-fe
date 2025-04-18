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
