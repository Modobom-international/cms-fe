import React from "react";

import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("text-muted-foreground text-sm", className)}>
      <div>
        <p>© {new Date().getFullYear()} Modobom CMS. All rights reserved.</p>
      </div>
    </footer>
  );
}

