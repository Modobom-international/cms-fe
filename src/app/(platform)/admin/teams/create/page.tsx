"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { type ITeamForm } from "@/validations/team.validation";
import { ChevronDown, ChevronRight, ChevronUp, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { Permission } from "@/types/team-permission.type";
import { useCreateTeam } from "@/hooks/team";
import { useGetTeamPermissionList } from "@/hooks/team";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateTeamPage() {
  const t = useTranslations("AddTeamPage");
  const router = useRouter();

  const {
    createTeamMutation,
    isCreatingTeam,
    createTeamForm,
  } = useCreateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = createTeamForm;

  const { data, isLoading, error } = useGetTeamPermissionList();

  const [openSections, setOpenSections] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (data?.success && data.transformedPermissions) {
      const newOpenSections: { [key: string]: boolean } = {};
      Object.keys(data.transformedPermissions).forEach((section) => {
        newOpenSections[section] = false;
      });
      setOpenSections(newOpenSections);
    }
  }, [data]);

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

  const permissions: Permission = data.transformedPermissions;

  const onSubmit = (data: ITeamForm) => {
    createTeamMutation(data, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message || "Tạo team thành công", {
            duration: 2000,
            position: "top-right",
          });
          setTimeout(() => {
            router.push("/admin/teams");
          }, 2000);
        } else {
          toast.error(response.message || "Tạo team không thành công", {
            duration: 3000,
            position: "top-right",
          });
        }
      },
      onError: (err: Error) => {
        toast.error(err.message || "Đã có lỗi xảy ra, vui lòng thử lại!", {
          duration: 3000,
          position: "top-right",
        });
      },
    });
  };

  const getSectionDisplayName = (section: string) => {
    const sectionKey = section.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    return sectionKey;
  };

  return (
    <div className="flex flex-col gap-8">
      <Toaster />
      <div className="flex flex-col gap-4">
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>{t("breadcrumb")}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{t("create.breadcrumb")}</span>
        </nav>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("create.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("create.description")}
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-lg bg-white">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("create.form.name")}</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={isSubmitting || isCreatingTeam}
                    placeholder={t("create.form.namePlaceholder")}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {t("create.form.validation.nameRequired")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-white">
              <div className="mb-6">
                <h2 className="font-medium text-gray-800">
                  {t("create.form.permissions")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("create.form.permissionsDescription")}
                </p>
              </div>
              <div className="space-y-4">
                {Object.entries(permissions).map(([section, routes]) => {
                  const allChecked = routes.every((route) =>
                    watch(`permissions.${section}_${route.name.replace(/\./g, "_")}`)
                  );
                  const someChecked = routes.some((route) =>
                    watch(`permissions.${section}_${route.name.replace(/\./g, "_")}`)
                  ) && !allChecked;

                  return (
                    <div key={section} className="rounded-md border">
                      <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`section-${section}`}
                            checked={allChecked}
                            className={someChecked ? "indeterminate" : ""}
                            onCheckedChange={(checked) => {
                              routes.forEach((route) => {
                                setValue(
                                  `permissions.${section}_${route.name.replace(/\./g, "_")}`,
                                  checked as boolean,
                                  { shouldDirty: true }
                                );
                              });
                            }}
                            disabled={isSubmitting || isCreatingTeam}
                          />
                          <Label htmlFor={`section-${section}`}>
                            {getSectionDisplayName(section)}
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
                            <div key={route.id} className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={`permission-${route.id}`}
                                  {...register(`permissions.${section}_${route.name.replace(/\./g, "_")}`)}
                                  checked={watch(`permissions.${section}_${route.name.replace(/\./g, "_")}`, false)}
                                  onCheckedChange={(checked) => {
                                    setValue(
                                      `permissions.${section}_${route.name.replace(/\./g, "_")}`,
                                      checked as boolean,
                                      { shouldDirty: true }
                                    );
                                  }}
                                  disabled={isSubmitting || isCreatingTeam}
                                />
                                <Label htmlFor={`permission-${route.id}`}>
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isSubmitting || isCreatingTeam}>
            {isSubmitting || isCreatingTeam
              ? t("create.form.processing")
              : t("create.form.saveButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}