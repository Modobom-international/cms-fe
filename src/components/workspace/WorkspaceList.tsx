"use client";

import Link from "next/link";

import { format } from "date-fns";
import { AlertCircle, Clock, Globe2, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGetWorkspaces } from "@/hooks/workspace";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { WorkspaceOperations } from "./WorkspaceOperations";

export function WorkspaceList() {
  const { workspaces, isLoading, error } = useGetWorkspaces();
  const t = useTranslations("Workspace");

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:bg-accent/5">
            <CardHeader>
              <Skeleton className="h-6 w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-[250px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("errors.failedToLoad")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <WorkspaceOperations />
      </div>

      {!workspaces?.length ? (
        <Alert>
          <AlertDescription>{t("errors.noWorkspaces")}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card
              key={workspace.workspace.id}
              className="group hover:bg-accent/5 hover:border-primary/20 relative border-2 transition-colors"
            >
              <Link href={`/workspaces/${workspace.workspace.id}/boards`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="line-clamp-2">
                        {workspace.workspace.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            workspace.workspace.visibility === "private"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {workspace.workspace.visibility === "private" ? (
                            <Lock className="text-muted-foreground mr-1 h-3 w-3" />
                          ) : (
                            <Globe2 className="text-muted-foreground mr-1 h-3 w-3" />
                          )}
                          {workspace.workspace.visibility === "private"
                            ? t("visibility.private")
                            : t("visibility.public")}
                        </Badge>
                        <Badge variant="outline">
                          {workspace.role === "owner"
                            ? t("role.owner")
                            : t("role.member")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {workspace.workspace.description || t("noDescription")}
                  </p>
                  <div className="text-muted-foreground mt-4 space-y-1 text-xs">
                    <div className="flex items-center">
                      <User className="mr-2 h-3 w-3" />
                      <span>
                        {t("owner")}: {workspace.workspace.owner.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-3 w-3" />
                      <span>
                        {t("created", {
                          date: format(
                            new Date(workspace.workspace.created_at),
                            "MMM d, yyyy"
                          ),
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Link>
              {workspace.role === "owner" && (
                <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <WorkspaceOperations workspace={workspace.workspace} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
