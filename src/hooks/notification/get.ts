import { useState, useEffect } from "react";
import { useNotificationsData } from "@/hooks/notification";
import { INotification } from "@/types/notification";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

export function useNotifications(socketUrl: string, email: string) {
  const { data: fetchedNotifications, isLoading } = useNotificationsData(email);
  const [socketNotifications, setSocketNotifications] = useState<INotification[]>(
    fetchedNotifications && "data" in fetchedNotifications ? fetchedNotifications.data : []
  );

  useEffect(() => {
    if (fetchedNotifications && "data" in fetchedNotifications) {
      setSocketNotifications(fetchedNotifications.data);
    } else {
      setSocketNotifications([]);
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    const echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: "localhost",
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ["ws"],
    });

    echo
      .private(`notifications.${email}`)
      .listen("NewNotification", (notification: INotification & { email?: string }) => {
        if (notification.email === email) {
          setSocketNotifications((prev) => [
            { ...notification, unread: true },
            ...prev,
          ]);
        }
      });

    return () => {
      echo.disconnect();
    };
  }, [socketUrl, email]);

  const markAsRead = (id: number) => {
    setSocketNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
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