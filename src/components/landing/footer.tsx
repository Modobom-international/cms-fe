import React from "react";

import Link from "next/link";

import { useTranslations } from "next-intl";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("Landing.Footer");

  return (
    <footer className="mt-20 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-white">
              <img src="/img/logo-modobom-resize.png" alt="Logo modobom" />
            </Link>
            <p className="mt-4 text-sm text-gray-400">{t("Description")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
              {t("SystemTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="#" text={t("Dashboard")} />
              <FooterLink href="#" text={t("Settings")} />
              <FooterLink href="#" text={t("Monitor")} />
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
              {t("SupportTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              <FooterLink href="#" text={t("Documentation")} />
              <FooterLink href="#" text={t("Guide")} />
              <FooterLink href="#" text={t("Contact")} />
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex space-x-6">
              <FooterLink
                href="#"
                text={t("InternalTerms")}
                className="text-sm text-gray-400 hover:text-gray-300"
              />
              <FooterLink
                href="#"
                text={t("PrivacyPolicy")}
                className="text-sm text-gray-400 hover:text-gray-300"
              />
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-400">
                &copy; {currentYear} Modobom
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  text: string;
  className?: string;
}

const FooterLink = ({
  href,
  text,
  className = "text-sm text-gray-300 transition-colors hover:text-white list-none",
}: FooterLinkProps) => (
  <li className="list-none">
    <a href={href} className={className}>
      {text}
    </a>
  </li>
);
