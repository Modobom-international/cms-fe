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
  success: true;
  data: IPaginationResponse<ITeam>;
  message?: string;
  type?: string;
}
