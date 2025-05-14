import React from "react";

import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <main className="relative flex-1">{children}</main>
              <Footer className="flex-none px-6 py-4" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
