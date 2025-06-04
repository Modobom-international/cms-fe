"use client";

import { useEffect, useState } from "react";

// Hook to safely detect when we're on the client side (hydrated)
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
