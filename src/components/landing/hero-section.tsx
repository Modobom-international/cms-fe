"use client";

import React, { useState } from "react";

import { useTranslations } from "next-intl";

export default function HeroSection() {
  const [hover, setHover] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const t = useTranslations("Landing.HeroSection");

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-50"></div>
        <div className="absolute top-0 right-0 -mt-16 opacity-20">
          <svg width="404" height="384" fill="none" viewBox="0 0 404 384">
            <defs>
              <pattern
                id="pattern-squares"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width="404" height="384" fill="url(#pattern-squares)" />
          </svg>
        </div>
      </div>

      <div className="relative mx-auto">
        <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
            {/* Left Content */}
            <div className="lg:col-span-6 lg:flex lg:flex-col lg:justify-center">
              <div className="max-w-xl space-y-8">
                <div className="space-y-4">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                    {t("Badge")}
                  </span>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="mb-2 block">{t("Heading1")}</span>
                    <span className="block h-20 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {t("Heading2")}
                    </span>
                  </h1>
                </div>

                <p className="mt-6 text-lg leading-8 text-gray-600">
                  {t("Description")}
                </p>

                {/* Feature List */}
                <FeatureList />

                <div className="flex items-center gap-x-6">
                  <a
                    href="#"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    className="relative inline-flex items-center rounded-lg bg-purple-600 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-purple-500 focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:outline-none"
                  >
                    {t("AccessSystem")}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`ml-2 h-5 w-5 transition-transform duration-300 ${
                        hover ? "translate-x-1" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </div>

                {/* System Info */}
                <SystemInfo />
              </div>
            </div>

            {/* Right Showcase */}
            <div className="mt-16 lg:col-span-6 lg:mt-0">
              <div className="relative">
                {/* Background Glow Effect */}
                <div className="absolute -inset-x-4 -top-12 -bottom-16 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-purple-100 opacity-20"></div>
                </div>

                {/* Showcase Window */}
                <ShowcaseWindow
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const FeatureList = () => {
  const t = useTranslations("Landing.HeroSection");

  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-base text-gray-600">{t(`Feature${index}`)}</p>
        </div>
      ))}
    </div>
  );
};

const SystemInfo = () => {
  const t = useTranslations("Landing.HeroSection");
  return (
    <div className="border-t border-gray-200 pt-8">
      <p className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
        {t("SystemInfoTitle")}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {[
          { value: "24/7", labelKey: "Monitoring" },
          { value: "99.9%", labelKey: "Uptime" },
          { value: "< 1s", labelKey: "Response" },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-500">{t(item.labelKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShowcaseWindow = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const t = useTranslations("Landing.HeroSection");
  return (
    <div className="relative rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
      {/* Window Header */}
      <WindowHeader />

      {/* Showcase Content */}
      <div className="relative rounded-b-2xl bg-slate-50 p-4">
        {/* Navigation Tabs */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "tracking" && <TrackingView />}
        {activeTab === "logs" && <LogsView />}
      </div>
    </div>
  );
};

const WindowHeader = () => {
  const t = useTranslations("Landing.HeroSection");
  return (
    <div className="relative rounded-t-2xl bg-slate-800 p-3">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {["red", "yellow", "green"].map((color) => (
            <div
              key={color}
              className={`h-3 w-3 rounded-full bg-${color}-500`}
            ></div>
          ))}
        </div>
        <div className="text-xs text-slate-400">{t("SystemMonitor")}</div>
      </div>
    </div>
  );
};

const TabNavigation = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const t = useTranslations("Landing.HeroSection");
  const tabs = [
    { id: "dashboard", labelKey: "TabDashboard" },
    { id: "tracking", labelKey: "TabTracking" },
    { id: "logs", labelKey: "TabLogs" },
  ];

  return (
    <div className="mb-4 flex space-x-4 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-slate-500"
          }`}
        >
          {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
};

// Tab Content Components
const DashboardView = () => {
  const t = useTranslations("Landing.HeroSection.Dashboard");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <div className="text-sm font-medium text-slate-500">
            {t("TodayAccess")}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            1,234
          </div>
          <div className="mt-1 text-sm text-green-500">
            {t("ComparedYesterday")}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <div className="text-sm font-medium text-slate-500">
            {t("TotalDomains")}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">45</div>
          <div className="mt-1 text-sm text-green-500">{t("AllActive")}</div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-900">
            {t("SystemStatus")}
          </h3>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {t("AllWorkingWell")}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {t("MainSystem")}
                </div>
                <div className="text-xs text-slate-500">
                  {t("WorkingNormally")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
              <span className="text-sm text-slate-500">100%</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t py-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {t("InternalNetwork")}
                </div>
                <div className="text-xs text-slate-500">
                  {t("ActiveDomains")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
              <span className="text-sm text-slate-500">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackingView = () => {
  const t = useTranslations("Landing.HeroSection.Tracking");
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-900">
            {t("RecentActivity")}
          </h3>
          <button className="text-sm text-purple-600 hover:text-purple-500">
            {t("ViewAll")}
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-4 w-4 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm text-slate-900">Admin</div>
                <div className="text-xs text-slate-500">
                  {t("UpdatedSystemConfig")}
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400">{t("JustNow")}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-4 w-4 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm text-slate-900">System</div>
                <div className="text-xs text-slate-500">{t("AutoBackup")}</div>
              </div>
            </div>
            <span className="text-xs text-slate-400">{t("MinutesAgo")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogsView = () => {
  const t = useTranslations("Landing.HeroSection.Logs");
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-900">
            {t("SystemLogs")}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
            <span className="text-xs text-slate-500">{t("Recording")}</span>
          </div>
        </div>
        <div className="space-y-2 font-mono text-xs">
          <div className="rounded bg-slate-50 p-2">
            <span className="text-slate-400">[12:45:30]</span>
            <span className="text-green-600">INFO</span>
            <span className="text-slate-700">{t("ConfigUpdated")}</span>
          </div>
          <div className="rounded bg-slate-50 p-2">
            <span className="text-slate-400">[12:45:28]</span>
            <span className="text-purple-600">DEBUG</span>
            <span className="text-slate-700">{t("DomainCheck")}</span>
          </div>
          <div className="rounded bg-slate-50 p-2">
            <span className="text-slate-400">[12:45:25]</span>
            <span className="text-yellow-600">WARN</span>
            <span className="text-slate-700">{t("InvalidAccess")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
