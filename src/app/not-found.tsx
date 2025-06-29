import Link from "next/link";

import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-purple-50 px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          {/* Left column with visual element */}
          <div className="order-2 flex flex-col items-center md:order-1 md:items-end">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-purple-200 opacity-70 blur-xl"></div>
              <h1 className="animate-in fade-in slide-in-from-bottom-4 relative text-[140px] leading-none font-bold tracking-tighter text-purple-600 duration-700 md:text-[180px]">
                404
              </h1>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 my-6 h-1 w-24 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 delay-150 duration-700"></div>
          </div>

          {/* Right column with content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 order-1 space-y-8 text-left delay-300 duration-700 md:order-2">
            <div className="space-y-3">
              <h2 className="text-2xl font-medium text-neutral-900 md:text-3xl">
                Page not found
              </h2>
              <p className="text-md text-neutral-600 md:text-lg">
                We couldn&apos;t find the page you&apos;re looking for. It might
                have been moved or doesn&apos;t exist.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-11 rounded-full bg-purple-600 px-6 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-md hover:shadow-purple-200">
                <Link href="/" className="inline-flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
