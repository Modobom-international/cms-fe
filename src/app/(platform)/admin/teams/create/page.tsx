"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Home,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types
interface PermissionRoute {
  id: number;
  name: string;
  prefix: string;
}

interface Permission {
  [key: string]: PermissionRoute[];
}

// Form Schema
const teamFormSchema = z.object({
  name: z.string().min(1, "Tên phòng ban không được để trống"),
  permissions: z.record(z.boolean()).default({}),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export default function CreateTeamPage() {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      permissions: {},
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = form;

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

  const [openSections, setOpenSections] = useState<{
    [key: string]: boolean;
  }>({
    "push-system": false,
    "log-behavior": false,
    users: false,
    domain: false,
    "html-source": false,
    "users-tracking": false,
    team: false,
  });

  const onSubmit = async (data: TeamFormValues) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Quản lý phòng ban</span>
          <ChevronRight className="h-4 w-4" />
          <span>Thêm phòng ban</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Thêm phòng ban
            </h1>
            <p className="text-muted-foreground text-sm">
              Thêm phòng ban mới vào hệ thống và phân quyền truy cập
            </p>
          </div>

          <Link
            href="/admin/teams"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {/* Rest of the form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Team Information */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white">
              <div className="mb-6">
                <h2 className="font-medium text-gray-800">
                  Thông tin phòng ban
                </h2>
                <p className="text-xs text-gray-500">
                  Nhập thông tin cơ bản của phòng ban
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Tên phòng ban</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={isSubmitting}
                    placeholder="Nhập tên phòng ban"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Permissions */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg bg-white p-6">
              <div className="mb-6">
                <h2 className="font-medium text-gray-800">
                  Phân quyền truy cập
                </h2>
                <p className="text-xs text-gray-500">
                  Thiết lập quyền truy cập cho phòng ban
                </p>
              </div>

              <div className="space-y-4">
                {Object.entries(permissions).map(([section, routes]) => (
                  <div key={section} className="rounded-md border">
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`section-${section}`}
                          checked={routes.every((route) =>
                            watch(`permissions.${section}_${route.name}`)
                          )}
                          onCheckedChange={(checked) => {
                            routes.forEach((route) => {
                              setValue(
                                `permissions.${section}_${route.name}`,
                                checked as boolean,
                                { shouldDirty: true }
                              );
                            });
                          }}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={`section-${section}`}>
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
                          <div key={route.id} className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`permission-${route.id}`}
                                {...register(
                                  `permissions.${section}_${route.name}`
                                )}
                                disabled={isSubmitting}
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tạo phòng ban"}
          </Button>
        </div>
      </form>
    </div>
  );
}
