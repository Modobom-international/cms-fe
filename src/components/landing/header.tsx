"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";

import { setUserLocale } from "@/lib/locale";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShadow, setShowShadow] = useState(false);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const t = useTranslations("Landing.Header");
  const locale = useLocale();

  const toggleLanguage = async () => {
    const newLocale = locale === "vi" ? "en" : "vi";

    await setUserLocale(newLocale);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setShowShadow(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm ${
        showShadow ? "shadow-sm" : ""
      }`}
    >
      <div className="relative">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex lg:col-start-2 lg:justify-center">
                  <img
                    src="/img/logo-modobom-resize-dark.png"
                    alt="Logo modobom"
                  />
                </div>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {/* System Menu */}
              <div
                className="nav-item relative"
                onMouseEnter={() => setSystemMenuOpen(true)}
                onMouseLeave={() => setSystemMenuOpen(false)}
              >
                <button className="group inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                  {t("System")}
                  <svg
                    className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${
                      systemMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {systemMenuOpen && (
                  <div
                    className="nav-dropdown absolute mt-0 -ml-4 w-screen max-w-md transform px-2"
                    style={{
                      perspective: "2000px",
                      transform: "rotateX(-15deg)",
                    }}
                  >
                    <div className="ring-opacity-5 overflow-hidden rounded-lg shadow-lg ring-1 ring-black">
                      <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                        {/* System Menu Items */}
                        <SystemMenuItem
                          title={t("Dashboard")}
                          description={t("DashboardDesc")}
                          icon={<ChartIcon />}
                        />
                        <SystemMenuItem
                          title={t("Settings")}
                          description={t("SettingsDesc")}
                          icon={<SettingsIcon />}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="#" text={t("Monitor")} />
              <NavLink href="#" text={t("Logs")} />
              <NavLink href="#" text={t("Support")} />
            </div>

            {/* Right Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                {locale === "vi" ? "English" : "Tiếng Việt"}
              </button>

              <Link
                href="/auth/login"
                className="group inline-flex items-center rounded-lg border border-transparent bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
              >
                {t("AccessSystem")}
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:ring-inset"
              >
                <span className="sr-only">{t("OpenMenu")}</span>
                {!mobileMenuOpen ? <MenuIcon /> : <CloseIcon />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute inset-x-0 transform border-b border-gray-200 bg-white shadow-lg lg:hidden">
            <div className="space-y-1 pt-2 pb-3">
              <MobileNavLink href="#" text={t("System")} />
              <MobileNavLink href="#" text={t("Monitor")} />
              <MobileNavLink href="#" text={t("Logs")} />
              <MobileNavLink href="#" text={t("Support")} />
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="space-y-1">
                {/* Mobile Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex w-full px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                >
                  <svg
                    className="mr-3 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  {locale === "vi" ? "English" : "Tiếng Việt"}
                </button>
                <MobileNavLink href="/auth/login" text={t("Login")} />
                <MobileNavLink href="#" text={t("AccessSystem")} isPurple />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Helper Components
const NavLink = ({ href, text }: { href: string; text: string }) => (
  <Link
    href={href}
    className="nav-link-active relative px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
  >
    {text}
  </Link>
);

const MobileNavLink = ({
  href,
  text,
  isPurple,
}: {
  href: string;
  text: string;
  isPurple?: boolean;
}) => (
  <Link
    href={href}
    className={`block px-4 py-2 text-base font-medium ${
      isPurple
        ? "text-purple-600 hover:text-purple-700"
        : "text-gray-500 hover:text-gray-900"
    } hover:bg-gray-50`}
  >
    {text}
  </Link>
);

const SystemMenuItem = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <Link
    href="#"
    className="-m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-50"
  >
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-purple-600 text-white sm:h-12 sm:w-12">
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-base font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

// Icons
const MenuIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
