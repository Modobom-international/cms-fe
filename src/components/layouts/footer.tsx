import React from "react";

export default function Footer() {
  return (
    <footer className="relative w-full">
      <div className="container mx-auto py-6">
        <nav className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <ul className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm">
            <li>© {new Date().getFullYear()} Modobom.inc</li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
