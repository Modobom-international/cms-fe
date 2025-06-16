"use client";

import Image from "next/image";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export default function ApplicationLogo({ className }: Props) {
  const { theme } = useTheme();
  return (
    <Image
      src={
        theme === "dark"
          ? "/img/logo-modobom-resize.png"
          : "/img/logo-modobom-resize-dark.png"
      }
      width={100}
      height={100}
      alt="Logo"
      className={cn(className)}
    />
  );
}
