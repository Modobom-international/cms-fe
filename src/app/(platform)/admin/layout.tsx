import React from "react";

import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Footer from "@/components/layouts/footer";
import MaxWidthWrapper from "@/components/layouts/max-width-wrapper";
import { SiteHeader } from "@/components/layouts/site-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      defaultOpen={defaultOpen}
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <MaxWidthWrapper className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
              <Footer />
            </MaxWidthWrapper>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
