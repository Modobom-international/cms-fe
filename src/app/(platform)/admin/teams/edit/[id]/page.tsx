"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { ITeamForm } from "@/validations/team.validation";
import { useGetTeamById, useUpdateTeam } from "@/hooks/team";
import { TeamForm } from "@/components/forms/team-form";
import { Home, ChevronRight } from "lucide-react";

export default function EditTeamPage() {
    const t = useTranslations("EditTeamPage");
    const router = useRouter();
    const { id } = useParams();

    const {
        data: teamResponse,
        isLoading,
        error,
    } = useGetTeamById(id as string);

    const { updateTeam, isUpdating } = useUpdateTeam();

    const handleSubmit = (data: ITeamForm) => {
        updateTeam(
            { id: id as string, data },
            {
                onSuccess: (response) => {
                    toast.success(response.message || t("success"), {
                        duration: 2000,
                        position: "top-right",
                    });
                    setTimeout(() => router.push("/admin/teams"), 2000);
                },
                onError: (err) => {
                    toast.error(err.message || t("error"), {
                        duration: 3000,
                        position: "top-right",
                    });
                },
            }
        );
    };

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

    if (error || !teamResponse?.success) {
        return (
            <div className="text-destructive">
                Error: {error?.message || (teamResponse && "message" in teamResponse ? teamResponse.message : "Team not found")}
            </div>
        );
    }

    const team = teamResponse.data;

    const initialData: ITeamForm = {
        name: team.name,
        permissions: (team.permissions || []).reduce((acc, perm) => {
            acc[perm.replace(/\./g, "_")] = true;
            return acc;
        }, {} as Record<string, boolean>),
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
                    <span>{t("edit.breadcrumb")}</span>
                </nav>
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t("edit.title")}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {t("edit.description")}
                        </p>
                    </div>
                </div>
            </div>
            <TeamForm
                onSubmit={handleSubmit}
                defaultValues={initialData}
                isSubmitting={isUpdating}
            />
        </div>
    );
}