"use client";

import { createContext, useContext, useEffect } from "react";
import Echo from "laravel-echo";
import { getEchoInstance, updateEchoAuthToken } from "@/lib/echo";
import Cookies from "js-cookie";

const EchoContext = createContext<Echo<"reverb"> | null>(null);

export const EchoProvider = ({ children }: { children: React.ReactNode }) => {
    const echo = getEchoInstance();

    useEffect(() => {
        const token = Cookies.get("access_token");
        if (token) {
            updateEchoAuthToken(token);
        }

        const checkTokenChange = () => {
            const newToken = Cookies.get("access_token");
            if (newToken && newToken !== token) {
                updateEchoAuthToken(newToken);
            }
        };

        const interval = setInterval(checkTokenChange, 1000);
        return () => clearInterval(interval);
    }, []);

    return <EchoContext.Provider value={echo}>{children}</EchoContext.Provider>;
};

export const useEcho = () => {
    const echo = useContext(EchoContext);
    if (!echo) {
        throw new Error("useEcho phải được dùng trong EchoProvider");
    }
    return echo;
};