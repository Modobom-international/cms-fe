"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Workspace {
  id: number;
  name: string;
  description: string;
}

export function WorkspaceList() {
  // TODO: Replace with actual API call
  const workspaces: Workspace[] = [
    {
      id: 1,
      name: "Personal Workspace",
      description: "My personal tasks and projects",
    },
    {
      id: 2,
      name: "Team Workspace",
      description: "Team collaboration space",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <Link key={workspace.id} href={`/workspaces/${workspace.id}/boards`}>
          <Card className="hover:bg-accent/5">
            <CardHeader>
              <CardTitle>{workspace.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {workspace.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
