import { useState, useEffect } from "react";
import { useNotificationsData } from "@/hooks/notification";
import { INotification } from "@/types/notification";
import Echo from "laravel-echo";
import Cookies from "js-cookie";

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
    // console.log("Initializing Echo with config:", {
    //   broadcaster: "reverb",
    //   key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    //   wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    //   wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
    //   wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "443"),
    //   forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    // });

    // const echo = new Echo({
    //   broadcaster: "reverb",
    //   key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    //   wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    //   wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
    //   wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "443"),
    //   forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    //   enabledTransports: ["ws", "wss"],
    //   disableStats: true,
    //   encrypted: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    //   scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME || "http",
    //   appId: process.env.NEXT_PUBLIC_REVERB_APP_ID,
    //   authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/broadcasting/auth`,
    //   auth: {
    //     headers: {
    //       Authorization: `Bearer ${Cookies.get("access_token") || ""}`,
    //     },
    //   },
    // });

    // console.log("Echo initialized:", echo);

    // echo
    //   .private(`notifications.${email}`)
    //   .listen("NotificationSystem", (notification: INotification & { email?: string }) => {
    //     console.log("Received notification:", notification);
    //     if (notification.email === email) {
    //       setSocketNotifications((prev) => [
    //         { ...notification, unread: true },
    //         ...prev,
    //       ]);
    //     }
    //   });

    // return () => {
    //   echo.disconnect();
    // };
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