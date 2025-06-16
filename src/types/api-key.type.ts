export type IApiKey = {
  id: number;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
};

export type IApiKeyWithKey = IApiKey & {
  key: string;
};

export interface IGetApiKeysResponse {
  success: true;
  data: IApiKey[];
  message: string;
  type: string;
}

export interface ICreateApiKeyResponse {
  success: true;
  data: IApiKeyWithKey;
  message: string;
  type: string;
}
