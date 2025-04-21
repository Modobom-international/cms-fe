export interface IUserTracking {
  event_name: string;
  event_data: IEventData;
  user_agent: string;
  ip: string;
  platform: string;
  language: string;
  cookies_enabled: boolean;
  screen_width: number;
  screen_height: number;
  timezone: string;
  timestamp: string;
  domain: string;
  uuid: string;
  path: string;
  id: {
    $oid: string;
  };
}

export interface IEventData {
  x?: number;
  y?: number;
  mouseMovements?: number;
  height?: number;
  start?: number;
  end?: number;
  total?: number;
  target?: string;
  device: string;
}

export interface IUserTrackingResponse {
  success: boolean;
  data: IPaginatedResponse<IUserTracking>;
  message: string;
  type: string;
}
