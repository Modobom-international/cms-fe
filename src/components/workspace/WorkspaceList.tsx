"use client";

import Link from "next/link";

import { AlertCircle } from "lucide-react";

import { useGetWorkspaces } from "@/hooks/workspace";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { WorkspaceOperations } from "./WorkspaceOperations";

export function WorkspaceList() {
  const { workspaces, isLoading, error } = useGetWorkspaces();

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
        <AlertDescription>
          Failed to load workspaces. Please try again later.
        </AlertDescription>
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
          <AlertDescription>
            No workspaces found. Create your first workspace to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="group hover:bg-accent/5 relative transition-colors"
            >
              <Link href={`/workspaces/${workspace.id}/boards`}>
                <CardHeader>
                  <CardTitle>{workspace.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {workspace.description}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Visibility:{" "}
                    {workspace.visibility.charAt(0).toUpperCase() +
                      workspace.visibility.slice(1)}
                  </p>
                </CardContent>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <WorkspaceOperations workspace={workspace} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
