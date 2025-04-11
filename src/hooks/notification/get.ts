import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationsData } from "@/hooks/notification";
import { INotification } from "@/types/notification";

export function useNotifications(socketUrl: string, email: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: fetchedNotifications, isLoading } = useNotificationsData(email);
  const [socketNotifications, setSocketNotifications] = useState<INotification[]>(
    fetchedNotifications && 'data' in fetchedNotifications ? fetchedNotifications.data : []
  );

  useEffect(() => {
    if (fetchedNotifications && 'data' in fetchedNotifications) {
      setSocketNotifications(fetchedNotifications.data);
    } else {
      setSocketNotifications([]);
    }
  }, [fetchedNotifications]);

  useEffect(() => {
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on("new-notification", (notification: INotification & { email?: string }) => {
      if (notification.email === email) {
        setSocketNotifications((prev) => [
          { ...notification, unread: true },
          ...prev,
        ]);
      }
    });

    return () => {
      newSocket.disconnect();
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