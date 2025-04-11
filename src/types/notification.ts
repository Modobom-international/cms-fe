export interface INotification {
    id: number;
    email: string;
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