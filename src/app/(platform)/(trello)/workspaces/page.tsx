import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { WorkspaceList } from "@/components/workspace/WorkspaceList";

export default function WorkspacesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Workspaces</h2>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <WorkspaceList />
      </Suspense>
    </div>
  );
}
