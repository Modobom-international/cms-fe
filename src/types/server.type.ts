export interface IServer {
  id: string | number;
  name: string;
  ip: string;
  created_at: string;
  updated_at: string;
}

export type IGetServerListResponse = IPaginationResponse<IServer>;
