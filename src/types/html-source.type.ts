export interface IHtmlSource {
  id?: string;
  pathway?: string;
  nation?: string;
  platform?: string;
  source?: string;
  device?: string;
  application_id?: string;
  version?: string;
  day_creation?: string;
  note?: string;
}

export interface IHtmlSourceResponse {
  success: boolean;
  message: string;
  data: IPaginatedResponse<IHtmlSource>;
}
