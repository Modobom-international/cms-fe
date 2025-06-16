"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { UpdateUserFormSchema } from "@/validations/user.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { useGetUserById, useUpdateUser } from "@/hooks/user";

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

interface Team {
  id: number;
  name: string;
}

interface PermissionRoute {
  id: number;
  name: string;
  prefix: string;
}

interface Permission {
  [key: string]: PermissionRoute[];
}

interface EditUserFormProps {
  userId: string;
}

export default function EditUserForm({ userId }: EditUserFormProps) {
  const t = useTranslations("UpdateUserPage");
  const router = useRouter();

  const { data: user, isLoading, isError } = useGetUserById(userId);
  const updateUser = useUpdateUser(userId);

  const [teams] = useState<Team[]>([
    { id: 1, name: "Development Team" },
    { id: 2, name: "Marketing Team" },
    { id: 3, name: "Sales Team" },
  ]);

  const [permissions] = useState<Permission>({
    "push-system": [
      { id: 1, name: "push.view", prefix: "push" },
      { id: 2, name: "push.create", prefix: "push" },
      { id: 3, name: "push.edit", prefix: "push" },
      { id: 4, name: "push.delete", prefix: "push" },
    ],
    "log-behavior": [
      { id: 5, name: "log.view", prefix: "log" },
      { id: 6, name: "log.export", prefix: "log" },
      { id: 7, name: "log.delete", prefix: "log" },
    ],
    users: [
      { id: 8, name: "users.view", prefix: "users" },
      { id: 9, name: "users.create", prefix: "users" },
      { id: 10, name: "users.edit", prefix: "users" },
      { id: 11, name: "users.delete", prefix: "users" },
    ],
    domain: [
      { id: 12, name: "domain.view", prefix: "domain" },
      { id: 13, name: "domain.create", prefix: "domain" },
      { id: 14, name: "domain.edit", prefix: "domain" },
      { id: 15, name: "domain.delete", prefix: "domain" },
    ],
    "html-source": [
      { id: 16, name: "html.view", prefix: "html" },
      { id: 17, name: "html.create", prefix: "html" },
      { id: 18, name: "html.edit", prefix: "html" },
      { id: 19, name: "html.delete", prefix: "html" },
    ],
    "users-tracking": [
      { id: 20, name: "tracking.view", prefix: "tracking" },
      { id: 21, name: "tracking.export", prefix: "tracking" },
      { id: 22, name: "tracking.delete", prefix: "tracking" },
    ],
    team: [
      { id: 23, name: "team.view", prefix: "team" },
      { id: 24, name: "team.create", prefix: "team" },
      { id: 25, name: "team.edit", prefix: "team" },
      { id: 26, name: "team.delete", prefix: "team" },
    ],
  });

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(UpdateUserFormSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      password: undefined,
      team_id: "",
      permissions: {},
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        team_id: user.team_id || "",
        permissions: {}, // Set default permissions from API if available
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateUser.mutateAsync(data);
      router.push("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive">{t("error.notFound")}</p>
        <Link
          href="/admin/users"
          className={buttonVariants({
            variant: "outline",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("actions.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - User Information */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-card rounded-lg">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">
                    {t("form.personalInfo")}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t("form.personalInfoDesc")}
                  </p>
                </div>
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
                  <p className="text-muted-foreground text-xs">
                    {t("form.passwordHint")}
                  </p>
                  {errors.password && (
                    <p className="text-destructive text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Team Selection */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="team">{t("form.team")}</Label>
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
            <div className="bg-card rounded-lg">
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
          <Button type="submit" disabled={isSubmitting || updateUser.isPending}>
            {updateUser.isPending ? t("actions.updating") : t("actions.update")}
          </Button>
        </div>
      </form>
    </div>
  );
}
