import { BellIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useNotifications } from "@/hooks/notification/get";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export default function NotificationsButton({ email }: { email: string }) {
  const socketUrl =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3003";
  const t = useTranslations("Notification");
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications(socketUrl, email);

  if (isLoading) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="relative"
        aria-label="Loading notifications"
        disabled
      >
        <BellIcon size={16} aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative"
          aria-label="Open notifications"
        >
          <BellIcon size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1" side="bottom" align="end">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold">{t("notifications")}</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline"
              onClick={markAllAsRead}
            >
              {t("markAllAsRead")}
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="bg-border -mx-1 my-1 h-px"
        ></div>
        {notifications.length === 0 ? (
          <div className="text-muted-foreground px-3 py-2 text-sm">
            {t("noNotifications")}
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
            >
              <div className="relative flex items-start pe-3">
                <div className="flex-1 space-y-1">
                  <button
                    className="text-foreground/80 text-left after:absolute after:inset-0"
                    onClick={() => markAsRead(notification.id)}
                  >
                    {notification.message}
                  </button>
                  <div className="text-muted-foreground text-xs">
                    {notification.created_at}
                  </div>
                </div>
                {notification.unread && (
                  <div className="absolute end-0 self-center">
                    <span className="sr-only">{t("unRead")}</span>
                    <Dot />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
