"use client";

import { useState } from "react";

import Link from "next/link";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Home,
} from "lucide-react";
import { useForm } from "react-hook-form";

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

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  team: z.string().min(1, "Please select a team"),
  permissions: z.record(z.boolean()).default({}),
});

type FormValues = z.infer<typeof formSchema>;

interface Team {
  id: number;
  name: string;
  permissions?: string[];
}

interface PermissionRoute {
  id: number;
  name: string;
  prefix: string;
}

interface Permission {
  [key: string]: PermissionRoute[];
}

export default function Page() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permissions: {},
    },
  });

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

  const onSubmit = async (data: FormValues) => {
    try {
      // Handle form submission
      console.log(data);
      // Add your API call here
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav className="text-muted-foreground flex items-center gap-2 text-sm">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Quản lý nhân viên</span>
          <ChevronRight className="h-4 w-4" />
          <span>Thêm nhân viên</span>
        </nav>

        {/* Title and Actions Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Thêm nhân viên
            </h1>
            <p className="text-muted-foreground text-sm">
              Thêm nhân viên mới vào hệ thống và phân quyền truy cập
            </p>
          </div>

          <Link
            href="/admin/users"
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
          {/* Left Column - User Information */}
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-card rounded-lg">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Thông tin cá nhân</h2>
                  <p className="text-muted-foreground text-sm">
                    Nhập thông tin cơ bản của nhân viên
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Tên</Label>
                  <Input
                    {...register("name")}
                    id="name"
                    placeholder="Nhập tên nhân viên"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Mật khẩu</Label>
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

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Số điện thoại</Label>
                  <Input
                    {...register("phone_number")}
                    id="phone_number"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {/* Address Field */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    {...register("address")}
                    id="address"
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                {/* Team Selection */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="team">Phòng ban</Label>
                  <Select
                    onValueChange={(value) => setValue("team", value)}
                    defaultValue={watch("team")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.team && (
                    <p className="text-destructive text-sm">
                      {errors.team.message}
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
                <h2 className="text-lg font-medium">Phân quyền truy cập</h2>
                <p className="text-muted-foreground text-sm">
                  Thiết lập quyền truy cập cho nhân viên
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tạo nhân viên"}
          </Button>
        </div>
      </form>
    </div>
  );
}
