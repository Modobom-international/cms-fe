export interface IDomain {
  id: number;
  action: string;
  details: IDetails;
  user_id: number;
  description: any;
  created_at: string;
  updated_at: string;
}

export interface IDomainActual {
  id: number;
  domain: string;
  time_expired: string;
  registrar: string;
  created_at: string;
  updated_at: string;
  is_locked: number;
  renewable: number;
  status: string;
  name_servers: string;
  renew_deadline: string;
  registrar_created_at: string;
  activeUsers?: number; // Add this new property
}

export interface IDomainResponse {
  success: boolean;
  data: IPaginatedResponse<IDomainActual>;
  message: string;
  type: string;
}

export interface IDetails {
  id: number;
  attributes?: IAttributes;
  logged_at: string;
  changes?: IChanges;
  original?: IOriginal;
}

export interface IAttributes {
  slugs: string;
  result_path: string;
  status: string;
  site_id: number;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface IChanges {
  updated_at: string;
  content: string;
}

export interface IOriginal {
  updated_at: string;
  content: string;
}

export interface IDomainPathResponse {
  success: boolean;
  data: IDomainPath;
  message: string;
  type: string;
}

export interface IDomainPath {
  id: number;
  site_id: number;
  name: string;
  slug: string;
  provider: number;
  created_at: string;
  updated_at: string;
  content: string;
}
