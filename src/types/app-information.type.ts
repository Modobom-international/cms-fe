export interface IAppInformation {
    id: string;
    user_id: string;
    request_id: string;
    app_name: string;
    app_version?: string;
    platform?: string;
    country?: string;
    network?: string;
    os_name: string;
    os_version: string;
    event_name: string;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface IAppInformationFilterMenu {
    id: string;
    key: string;
    data: {
        app_name: string[];
        os_name: string[];
        os_version: string[];
        app_version: string[];
        category: string[];
        event_name: string[];
        platform: string[];
        country: string[];
        network: string[];
    };
    description: string;
    updated_at: string;
    created_at: string;
}

export interface IAppInformationFilterMenuResponse {
    success: boolean;
    data: IAppInformationFilterMenu;
    message: string;
    type: string;
}

export type IGetAppInformationResponse = IPaginationResponse<IAppInformation>