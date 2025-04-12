import { useState, useEffect } from "react";
import { useNotificationsData } from "@/hooks/notification";
import { INotification } from "@/types/notification";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";
import { env } from "@/env";

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
    console.log("Khởi tạo Pusher với cấu hình:", {
      wsHost: env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: env.NEXT_PUBLIC_REVERB_PORT,
      wssPort: env.NEXT_PUBLIC_REVERB_PORT,
      forceTLS: env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    });

    const pusherClient = new Pusher(env.NEXT_PUBLIC_REVERB_APP_KEY, {
      wsHost: env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: parseInt(env.NEXT_PUBLIC_REVERB_PORT),
      wssPort: parseInt(env.NEXT_PUBLIC_REVERB_PORT),
      forceTLS: env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
      cluster: "as1",
    });

    console.log("Pusher đã được khởi tạo:", pusherClient);

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

    console.log("Echo đã được khởi tạo:", echo);

    echo
      .private(`notifications.${email}`)
      .listen("NotificationSystem", (notification: INotification & { email?: string }) => {
        console.log("Nhận được thông báo:", notification);
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