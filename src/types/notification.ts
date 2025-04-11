export interface INotification {
    id: number;
    user_id: number;
    message: string;
    unread: boolean;
    updated_at: string;
    created_at: string;
}

export interface INotificationsResponse {
    success: boolean;
    data: INotification[];
    message: string;
    type: string;
}