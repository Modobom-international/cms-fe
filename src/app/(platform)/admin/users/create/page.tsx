"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateUserFormSchema } from "@/validations/user.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Home,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useCreateUser } from "@/hooks/user";
import { useGetTeamPermissionList } from "@/hooks/team";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITeam } from "@/types/team.type";
import { Permission } from "@/types/team-permission.type";

export default function Page() {
  const t = useTranslations("CreateUserPage");
  const router = useRouter();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreateUserFormSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      team_id: "",
      permissions: {},
    },
  });

  const { data, isLoading, error } = useGetTeamPermissionList();

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const onSubmit = async (data: any) => {
    try {
      await createUser.mutateAsync(data);
      router.push("/admin/users/store");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
          ></path>
        </svg>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="text-destructive">
        Error: {error?.message || data?.message || "Something went wrong"}
      </div>
    );
  }

  const teams: ITeam[] = data.data.teams;
  const permissions: Permission = data.transformedPermissions;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>User Management</span>
          <ChevronRight className="h-4 w-4" />
          <span>{t("breadcrumb")}</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>

          <Link
            href="/admin/users"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("actions.backToList")}
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - User Information */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-card rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium">
                  {t("form.personalInfo")}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {t("form.personalInfoDesc")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("form.name")}</Label>
                  <Input
                    {...register("name")}
                    id="name"
                    placeholder={t("form.namePlaceholder")}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("form.email")}</Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t("form.password")}</Label>
                  <Input
                    {...register("password")}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Team Selection */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="team_id">{t("form.team")}</Label>
                  <Select
                    onValueChange={(value) => setValue("team_id", value)}
                    defaultValue={watch("team_id")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.teamPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.team_id && (
                    <p className="text-destructive text-sm">
                      {errors.team_id.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Permissions */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium">{t("form.permissions")}</h2>
                <p className="text-muted-foreground text-sm">
                  {t("form.permissionsDesc")}
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(permissions).map(([section, routes]) => (
                  <div key={section} className="bg-card rounded-lg border">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={routes.every((route) =>
                            watch(`permissions.${section}_${route.name}`)
                          )}
                          onCheckedChange={(checked) => {
                            routes.forEach((route) => {
                              setValue(
                                `permissions.${section}_${route.name}`,
                                checked as boolean
                              );
                            });
                          }}
                        />
                        <Label className="font-medium">
                          {section
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setOpenSections((prev) => ({
                            ...prev,
                            [section]: !prev[section],
                          }))
                        }
                      >
                        {openSections[section] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {openSections[section] && (
                      <div className="divide-y border-t">
                        {routes.map((route) => (
                          <div key={route.id} className="hover:bg-muted/50 p-4">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                {...register(
                                  `permissions.${section}_${route.name}`
                                )}
                              />
                              <Label className="font-normal">
                                {route.name
                                  .split(".")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isSubmitting || createUser.isPending}>
            {createUser.isPending ? t("actions.creating") : t("actions.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}