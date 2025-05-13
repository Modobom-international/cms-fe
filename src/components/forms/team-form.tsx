import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ITeamForm, TeamFormSchema } from "@/validations/team.validation";
import { Permission } from "@/types/team-permission.type";
import { useGetTeamPermissionList } from "@/hooks/team";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ChevronDown,
    ChevronUp,
    Home,
    ChevronRight,
} from "lucide-react";

interface TeamFormProps {
    onSubmit: (data: ITeamForm) => void;
    defaultValues?: ITeamForm;
    isSubmitting: boolean;
}

export function TeamForm({ onSubmit, defaultValues, isSubmitting }: TeamFormProps) {
    const t = useTranslations("TeamForm");
    const tEdit = useTranslations("EditTeamPage");

    const { data, isLoading, error } = useGetTeamPermissionList();

    const form = useForm<ITeamForm>({
        resolver: zodResolver(TeamFormSchema),
        defaultValues: defaultValues || {
            name: "",
            permissions: {},
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = form;

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

    const renderLayout = (content: JSX.Element) => (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <nav className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                    <span>{tEdit("breadcrumb")}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{tEdit("edit.breadcrumb")}</span>
                </nav>
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {tEdit("edit.title")}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {tEdit("edit.description")}
                        </p>
                    </div>
                </div>
            </div>
            {content}
        </div>
    );

    if (isLoading) {
        return renderLayout(
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
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                </svg>
            </div>
        );
    }

    if (error || !data?.success) {
        return renderLayout(
            <div className="text-destructive">
                Error: {error?.message || data?.message || "Something went wrong"}
            </div>
        );
    }

    const permissions: Permission = data.transformedPermissions;

    const getSectionDisplayName = (section: string) => {
        const sectionKey = section.replace(/-/g, "");
        return t(`permissionSections.${sectionKey}`);
    };

    return renderLayout(
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6">
                    <div className="rounded-lg bg-white">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">{t("name")}</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    disabled={isSubmitting}
                                    placeholder={t("namePlaceholder")}
                                />
                                {errors.name && (
                                    <p className="text-destructive text-sm">
                                        {t("validation.nameRequired")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6 lg:col-span-2">
                    <div className="bg-white">
                        <div className="mb-6">
                            <h2 className="font-medium text-gray-800">{t("permissions")}</h2>
                            <p className="text-xs text-gray-500">{t("permissionsDescription")}</p>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
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
                                                    disabled={isSubmitting}
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
                                                                disabled={isSubmitting}
                                                            />
                                                            <Label htmlFor={`permission-${route.id}`}>
                                                                {route.name
                                                                    .split(".")
                                                                    .map(
                                                                        (word) =>
                                                                            word.charAt(0).toUpperCase() + word.slice(1)
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
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t("processing") : t("save")}
                </Button>
            </div>
        </form>
    );
}