export interface IAppInformation {
    request_id: string;
    app_name: string;
    app_id: string;
    app_version: string;
    os_name: string;
    os_version: string;
    event_name: string;
    event_value: string;
    category: string;
    created_at?: string;
}

export type IGetAppInformationResponse = IPaginationResponse<IAppInformation>