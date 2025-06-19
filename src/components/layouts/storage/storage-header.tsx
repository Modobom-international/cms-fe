"use client";

import { useAuth } from "@/providers/auth-provider";
import { SidebarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import LanguageSwitcher from "@/components/i18n/language-switcher";
import NotificationsButton from "@/components/notifications";

export function StorageHeader() {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full items-center border-b">
      <div className="flex w-full items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-3">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {user && user.email ? (
              <NotificationsButton email={user.email} />
            ) : (
              <Skeleton className="h-6 w-6 rounded-lg" />
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

