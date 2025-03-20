import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Footer from "@/components/layouts/footer";
import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layouts/site-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <main className="container mx-auto py-10">
                {children}
                <Footer />
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
