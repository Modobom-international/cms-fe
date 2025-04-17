"use client";

import { useAuth } from "@/providers/auth-provider";
import { format } from "date-fns";
import {
  Briefcase,
  Building,
  Calendar,
  ChevronRight,
  DollarSign,
  Home,
  ImageIcon,
  LogOut,
  Mail,
  Shield,
  Terminal,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { formatDateTime } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PersonalInfoTab } from "@/components/profile/personal-info-tab";
import { SecurityTab } from "@/components/profile/security-tab";

export default function Page() {
  const t = useTranslations("ProfilePage");

  const { user, isLoadingUser } = useAuth();

  return (
    <div className="space-y-8 pb-10">
      {/* Header section */}
      <div>
        {/* Breadcrumbs */}
        <div className="text-muted-foreground mb-4 flex items-center text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="mx-2 h-4 w-4" />
          <span>{t("header.title")}</span>
        </div>

        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.name && !isLoadingUser ? (
                <span>{t("header.welcome", { name: user.name })}</span>
              ) : (
                <Skeleton className="h-6 w-32" />
              )}
            </h1>
            <p className="text-muted-foreground mt-1">{t("header.subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{t("header.status")}</p>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {t("header.active")}
              </span>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-right">
              <p className="text-sm font-medium">{t("header.lastLogin")}</p>
              <p className="text-muted-foreground text-sm">
                {formatDateTime(new Date())}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar with profile summary and navigation */}
        <div className="space-y-6 lg:col-span-4">
          {/* Profile Summary Card with Work Information */}
          <div className="flex flex-col gap-4">
            <div className="group overflow-hidden rounded-xl border transition-all duration-300">
              <div className="relative">
                <div className="from-primary/70 to-primary/90 h-32 bg-gradient-to-r"></div>
                <div className="absolute inset-0 h-32 bg-center opacity-20"></div>
                <div className="absolute -bottom-12 left-6">
                  <div className="relative">
                    <Avatar className="border-background h-24 w-24 border-4 shadow-md transition-all duration-300 group-hover:scale-105">
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-medium">
                        Mo
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -right-1 -bottom-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="border-primary/20 bg-background hover:bg-primary/5 h-7 w-7 rounded-full shadow-sm"
                            >
                              <ImageIcon className="text-primary h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("profile.actions.updateAvatar")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="pt-16 pb-5">
                <div className="flex flex-col items-start">
                  <div className="flex w-full items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {user?.name && !isLoadingUser ? (
                        <span>{user.name}</span>
                      ) : (
                        <Skeleton className="h-6 w-20" />
                      )}
                    </h2>
                    {user?.type_user && !isLoadingUser ? (
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/10 text-primary hover:border-primary/30 hover:bg-primary/15 font-medium transition-all duration-300"
                      >
                        <span className="first-letter:uppercase">
                          {user.type_user}
                        </span>
                      </Badge>
                    ) : (
                      <Skeleton className="h-4 w-12" />
                    )}
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {user?.email && !isLoadingUser ? (
                      <p className="text-sm">{user.email}</p>
                    ) : (
                      <span className="text-sm">
                        <Skeleton className="h-4 w-28" />
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <Separator />
              {/* Work Information integrated into Profile Card */}
              <CardContent className="py-4">
                <h3 className="text-muted-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{t("profile.workInfo.title")}</span>
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="bg-muted/30 hover:bg-muted/40 rounded-md p-3 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="bg-primary/10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full">
                        <Terminal className="text-primary h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          {t("profile.workInfo.position")}
                        </p>
                        {/* Position is not available in the IUser type yet */}
                        <span className="mt-0.5 block text-sm font-medium">
                          —
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 hover:bg-muted/40 rounded-md p-3 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="bg-primary/10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full">
                        <Building className="text-primary h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          {t("profile.workInfo.team")}
                        </p>
                        {/* Team is not available in the IUser type yet */}
                        <span className="mt-0.5 block text-sm font-medium">
                          —
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 hover:bg-muted/40 rounded-md p-3 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="bg-primary/10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full">
                        <Calendar className="text-primary h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          {t("profile.workInfo.joinDate")}
                        </p>
                        {/* We can use created_at from IUser as joinDate */}
                        {user?.created_at && !isLoadingUser ? (
                          <p className="mt-0.5 text-sm font-medium">
                            {format(new Date(user.created_at), "yyyy-MM-dd")}
                          </p>
                        ) : (
                          <span className="mt-0.5 block text-sm font-medium">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 hover:bg-muted/40 rounded-md p-3 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="bg-primary/10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full">
                        <DollarSign className="text-primary h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">
                          {t("profile.workInfo.salary")}
                        </p>
                        {/* Salary is not available in the IUser type yet */}
                        <span className="mt-0.5 block text-sm font-medium">
                          —
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Quick Actions */}
            <Button variant="outline">
              <LogOut className="h-4 w-4" />
              <span>{t("profile.actions.logout")}</span>
            </Button>
          </div>
        </div>

        {/* Main Content - Tabbed Interface */}
        <div className="lg:col-span-8">
          <div className="border-none">
            <CardHeader className="pb-2">
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6 h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:text-primary data-[state=active]:after:bg-primary relative gap-2 rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <User className="size-4" />
                    <span>Personal Info</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="data-[state=active]:text-primary data-[state=active]:after:bg-primary relative gap-2 rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Shield className="size-4" />
                    <span>Security</span>
                  </TabsTrigger>
                </TabsList>

                <div className="max-h-full overflow-visible">
                  <PersonalInfoTab />
                  <SecurityTab />
                </div>
              </Tabs>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
