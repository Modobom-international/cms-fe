import { useEffect, useState } from "react";
import { useEcho } from "@/components/context/echo";
import { INotification } from "@/types/notification";
import { useNotificationsData } from "@/hooks/notification";

export function useNotifications(socketUrl: string, email: string) {
  const echo = useEcho();
  const { data: fetchedNotifications, isLoading } = useNotificationsData(email);
  const [socketNotifications, setSocketNotifications] = useState<
    INotification[]
  >(
    fetchedNotifications && "data" in fetchedNotifications
      ? fetchedNotifications.data
      : []
  );

  useEffect(() => {
    if (fetchedNotifications && "data" in fetchedNotifications) {
      setSocketNotifications(fetchedNotifications.data);
    } else {
      setSocketNotifications([]);
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    echo
      .private(`notifications.${email}`)
      .listen(
        "NotificationSystem",
        (notification: INotification & { email?: string }) => {
          console.log("Nhận được thông báo:", notification);
          if (notification.email === email) {
            setSocketNotifications((prev) => [
              { ...notification, unread: true },
              ...prev,
            ]);
          }
        }
      );

    return () => {
      echo.disconnect();
    };
  }, [socketUrl, email]);

  const markAsRead = (id: number) => {
    setSocketNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setSocketNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );
  };

  const unreadCount = socketNotifications.filter((n) => n.unread).length;

  return {
    notifications: socketNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  };
}
