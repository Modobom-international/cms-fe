import React from "react";

import { cn } from "@/lib/utils";

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto h-full w-full max-w-[85rem] px-2.5 md:px-20 xl:px-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
