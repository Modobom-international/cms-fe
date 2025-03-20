"use client";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export default function ApplicationLogo({ className }: Props) {
  const { theme } = useTheme();
  return (
    <img
      src={
        theme === "dark"
          ? "/img/logo-modobom-resize.png"
          : "/img/logo-modobom-resize-dark.png"
      }
      alt="Logo"
      className={cn(className)}
    />
  );
}
