import Cookies from "js-cookie";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance: Echo<"reverb"> | null = null;

export const getEchoInstance = () => {
  if (!echoInstance && typeof window !== "undefined") {
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY!, {
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT!),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT!),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
      cluster: "as1",
    });

    echoInstance = new Echo<"reverb">({
      broadcaster: "reverb",
      client: pusherClient,
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
      appId: process.env.NEXT_PUBLIC_REVERB_APP_ID!,
      authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token") || ""}`,
        },
      },
    });
  }
  return echoInstance;
};

export const updateEchoAuthToken = (token: string) => {
  const echo = getEchoInstance();
  if (echo) {
    echo.options.auth = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
};
