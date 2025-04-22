export interface IUserTrackingData {
  uuid: string;
  event_name: string;
  event_data: IEventData;
  timestamp: string;
  user: IUser;
  domain: string;
  path: string;
  updated_at: string;
  created_at: string;
  id: string;
}

export interface IEventData {
  scrollTop?: number;
  scrollLeft?: number;
  device: string;
  x?: number;
  y?: number;
  elementDetails?: IElementDetails;
  href?: string;
  isInternalLink?: boolean;
  isLassoButton?: boolean;
  lassoButtonLink: any;
  height?: number;
  mouseMovements?: number;
}

export interface IElementDetails {
  tagName: string;
  classes: string[];
  textContent?: string;
  attributes: IAttributes;
  position: IPosition;
  parentTag: string;
  isButton: boolean;
  isInput: boolean;
  id: string;
}

export interface IAttributes {
  href?: string;
  class?: string;
  id: string;
  src?: string;
  alt?: string;
}

export interface IPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IUser {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  cookiesEnabled: boolean;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  performance: IPerformance;
  browser: IBrowser;
  windowSize: IWindowSize;
  connection: IConnection;
  touchSupport: boolean;
  webGLSupport: boolean;
  referrer: string;
  trafficSource: string;
  pageLoadTime: number;
  battery: any;
}

export interface IPerformance {
  connectStart: number;
  secureConnectionStart: number;
  unloadEventEnd: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  responseStart: number;
  connectEnd: number;
  responseEnd: number;
  requestStart: number;
  domLoading: number;
  redirectStart: number;
  loadEventEnd: number;
  domComplete: number;
  navigationStart: number;
  loadEventStart: number;
  domContentLoadedEventEnd: number;
  unloadEventStart: number;
  redirectEnd: number;
  domInteractive: number;
  fetchStart: number;
  domContentLoadedEventStart: number;
}

export interface IBrowser {
  name: string;
  version: string;
}

export interface IWindowSize {
  width: number;
  height: number;
}

export interface IConnection {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

// Use global pagination interfaces from backend.d.ts
export type IUserTrackingResponse = IPaginationResponse<IUserTrackingData>;
export type IUserTrackingErrorResponse = IErrorPaginationResponse;
