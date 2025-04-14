import { useEffect, useState } from "react";

import { env } from "@/env";
import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

import { IDomainActual } from "@/types/domain.type";

export const useActiveUsers = (domains: IDomainActual[]) => {
  const [activeUsers, setActiveUsers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!domains.length) return;

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
      broadcaster: "pusher",
      client: pusherClient,
      auth: {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token") || ""}`,
        },
      },
    });

    // Subscribe to each domain's channel
    domains.forEach((domain) => {
      echo
        .channel(`active-users.${domain}`)
        .listen("ActiveUsersUpdated", (data: { count: number }) => {
          setActiveUsers((prev) => ({
            ...prev,
            [domain.domain]: data.count,
          }));
        });
    });

    return () => {
      // Cleanup subscriptions
      domains.forEach((domain) => {
        echo.leave(`active-users.${domain}`);
      });
    };
  }, [domains.join(",")]); // Dependency on stringified domains array

  return activeUsers;
};

