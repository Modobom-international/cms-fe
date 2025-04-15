import { useEffect, useState } from "react";

import { IDomainActual } from "@/types/domain.type";

export const useActiveUsers = (domains: IDomainActual[]) => {
  const [activeUsers, setActiveUsers] = useState<Record<string, number>>({});

  useEffect(() => {

  }, [domains.join(",")]); // Dependency on stringified domains array

  return activeUsers;
};

