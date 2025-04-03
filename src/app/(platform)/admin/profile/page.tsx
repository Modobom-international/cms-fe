"use client";

import { useState } from "react";

import {
  Briefcase,
  Building,
  Calendar,
  ChevronRight,
  DollarSign,
  Edit2,
  Home,
  ImageIcon,
  LogOut,
  Mail,
  Shield,
  Terminal,
  User,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn, formatCurrency } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserProfile {
  name: string;
  email: string;
  title: string;
  position: string;
  team: string;
  salary: number;
  joinDate: string;
  completionPercentage?: number;
}

export default function Page() {
  const t = useTranslations("ProfilePage");

  const [user, _setUser] = useState<UserProfile>({
    name: "John Doe",
    email: "john@example.com",
    title: "Staff",
    position: "Developer",
    team: "Engineering",
    salary: 20000000,
    joinDate: new Date().toLocaleDateString(),
    completionPercentage: 85,
  });

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const [activeTab, setActiveTab] = useState("profile");

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
              {t("header.welcome", { name: user.name })}
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
                {new Date().toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
            <div className="group overflow-hidden border-none transition-all duration-300">
              <div className="relative">
                <div className="from-primary/70 to-primary/90 h-32 bg-gradient-to-r"></div>
                <div className="absolute inset-0 h-32 bg-[url('/profile-pattern.svg')] bg-center opacity-20"></div>
                <div className="absolute right-0 bottom-0 p-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("profile.actions.editCover")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="absolute -bottom-12 left-6">
                  <div className="relative">
                    <Avatar className="border-background h-24 w-24 border-4 shadow-md transition-all duration-300 group-hover:scale-105">
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-medium">
                        {getInitials(user.name)}
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
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/10 text-primary hover:border-primary/30 hover:bg-primary/15 font-medium transition-all duration-300"
                    >
                      {user.title}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <p className="text-sm">{user.email}</p>
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
                        <p className="mt-0.5 text-sm font-medium">
                          {user.position}
                        </p>
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
                        <p className="mt-0.5 text-sm font-medium">
                          {user.team}
                        </p>
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
                        <p className="mt-0.5 text-sm font-medium">
                          {user.joinDate}
                        </p>
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
                        <p className="mt-0.5 text-sm font-medium">
                          {formatCurrency(user.salary)}
                        </p>
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
              <Tabs
                defaultValue="profile"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="bg-muted/50 mb-6 grid w-full grid-cols-2 p-1">
                  <TabsTrigger
                    value="profile"
                    className={cn(
                      "gap-2 rounded-md transition-all data-[state=active]:shadow-sm",
                      activeTab === "profile"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground/80"
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span>{t("profile.tabs.personal")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className={cn(
                      "gap-2 rounded-md transition-all data-[state=active]:shadow-sm",
                      activeTab === "security"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground/80"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span>{t("profile.tabs.security")}</span>
                  </TabsTrigger>
                </TabsList>

                <div className="max-h-full overflow-visible">
                  <TabsContent value="profile" className="mt-0 space-y-6 pb-4">
                    <div className="space-y-6">
                      <div className="bg-card text-card-foreground rounded-lg border p-5 shadow-sm">
                        <h3 className="mb-4 font-medium">
                          {t("personalInfo.basicInfo")}
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label
                              htmlFor="name"
                              className="text-sm font-medium"
                            >
                              {t("personalInfo.name")}
                            </Label>
                            <Input id="name" defaultValue={user.name} />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-medium"
                            >
                              {t("personalInfo.email")}
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              defaultValue={user.email}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notification preferences */}
                      <div className="bg-card text-card-foreground rounded-lg border p-5 shadow-sm">
                        <h3 className="mb-4 font-medium">
                          {t("personalInfo.notifications.title")}
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium">
                                {t(
                                  "personalInfo.notifications.emailNotifications.title"
                                )}
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                {t(
                                  "personalInfo.notifications.emailNotifications.description"
                                )}
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium">
                                {t(
                                  "personalInfo.notifications.systemNotifications.title"
                                )}
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                {t(
                                  "personalInfo.notifications.systemNotifications.description"
                                )}
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium">
                                {t(
                                  "personalInfo.notifications.updateNotifications.title"
                                )}
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                {t(
                                  "personalInfo.notifications.updateNotifications.description"
                                )}
                              </p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="px-6 shadow-sm">
                          {t("personalInfo.saveChanges")}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="mt-0 space-y-6 pb-4">
                    <div className="space-y-6">
                      {/* Password form */}
                      <div className="bg-card text-card-foreground rounded-lg border p-5 shadow-sm">
                        <h3 className="mb-4 font-medium">
                          {t("security.changePassword.title")}
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="current_password"
                              className="text-sm font-medium"
                            >
                              {t("security.changePassword.currentPassword")}
                            </Label>
                            <Input id="current_password" type="password" />
                          </div>

                          <div className="border-border/30 border-t pt-2">
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="new_password"
                                  className="text-sm font-medium"
                                >
                                  {t("security.changePassword.newPassword")}
                                </Label>
                                <Input id="new_password" type="password" />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="confirm_password"
                                  className="text-sm font-medium"
                                >
                                  {t("security.changePassword.confirmPassword")}
                                </Label>
                                <Input id="confirm_password" type="password" />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button className="mt-2">
                              {t("security.changePassword.updatePassword")}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Login security section */}
                      <div className="bg-card text-card-foreground rounded-lg border p-5 shadow-sm">
                        <h3 className="mb-4 font-medium">
                          {t("security.loginSecurity.title")}
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium">
                                {t("security.loginSecurity.twoFactor.title")}
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                {t(
                                  "security.loginSecurity.twoFactor.description"
                                )}
                              </p>
                            </div>
                            <Switch />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium">
                                {t(
                                  "security.loginSecurity.newDeviceLogin.title"
                                )}
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                {t(
                                  "security.loginSecurity.newDeviceLogin.description"
                                )}
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone - Styled for emphasis */}
                      <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-5">
                        <div className="flex items-start gap-3">
                          <XCircle className="text-destructive mt-0.5 h-5 w-5" />
                          <div className="flex-1">
                            <h3 className="text-destructive font-medium">
                              {t("security.dangerZone.title")}
                            </h3>
                            <p className="text-muted-foreground mt-1 mb-4 text-sm">
                              {t("security.dangerZone.description")}
                            </p>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-destructive/90 hover:bg-destructive"
                            >
                              {t("security.dangerZone.deleteAccount")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
