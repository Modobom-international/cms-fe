export interface ITeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ITeam {
  id: string;
  name: string;
  permissions: string[];
  members?: ITeamMember[];
  created_at: string;
  updated_at: string;
}

export interface ITeamResponse {
  success: boolean;
  data: {
    data: ITeam[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
  type?: string;
}

export interface IErrorResponse {
  success: false;
  message: string;
  type: string;
}
