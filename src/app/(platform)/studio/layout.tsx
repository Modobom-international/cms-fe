import React from "react";

import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { EchoProvider } from "@/components/context/echo";
import Footer from "@/components/layouts/footer";
import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layouts/site-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col" defaultOpen={defaultOpen}>
        <EchoProvider>
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4">
                <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                  <Footer />
                </main>
              </div>
            </SidebarInset>
          </div>
        </EchoProvider>
      </SidebarProvider>
    </div>
  );
}

