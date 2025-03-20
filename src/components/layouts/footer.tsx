import React from "react";

export default function Footer() {
    return (
        <footer className="relative w-full">
            <div className="container mx-auto py-6">
                <nav className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <ul className="flex items-center gap-4 flex-wrap justify-center text-sm text-muted-foreground">
                        <li>© {new Date().getFullYear()} Modobom.inc</li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
}
