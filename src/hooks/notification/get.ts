import { useEffect, useState } from "react";

import { env } from "@/env";
import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

import { INotification } from "@/types/notification";

import { useNotificationsData } from "@/hooks/notification";

export function useNotifications(socketUrl: string, email: string) {
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
    const pusherClient = new Pusher(env.NEXT_PUBLIC_REVERB_APP_KEY, {
      wsHost: env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: parseInt(env.NEXT_PUBLIC_REVERB_PORT),
      wssPort: parseInt(env.NEXT_PUBLIC_REVERB_PORT),
      forceTLS: env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
      cluster: "as1",
    });

    const echo = new Echo({
      broadcaster: "reverb",
      client: pusherClient,
      key: env.NEXT_PUBLIC_REVERB_APP_KEY,
      appId: env.NEXT_PUBLIC_REVERB_APP_ID,
      authEndpoint: `${env.NEXT_PUBLIC_BACKEND_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token") || ""}`,
        },
      },
    });

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
