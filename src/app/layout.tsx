import { Plus_Jakarta_Sans as JakartaSans } from "next/font/google";

import { constructMetadata } from "@/configs/site.config";
import AuthProvider from "@/providers/auth-provider";
import { ReactQueryClientProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

import { EchoProvider } from "@/components/context/echo";
import ScrollToTop from "@/components/layouts/scroll-to-top";

import "@/styles/globals.css";

const jakarta = JakartaSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(jakarta.variable, "font-jakarta antialiased")}>
        <ReactQueryClientProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
              >
                <NextTopLoader height={4} color="#7c3aed" showSpinner={false} />
                <NuqsAdapter>
                  <Toaster />
                  <EchoProvider>
                    <main className="bg-background relative flex min-h-svh flex-col">
                      {children}
                      <ScrollToTop />
                    </main>
                  </EchoProvider>
                </NuqsAdapter>
              </ThemeProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
