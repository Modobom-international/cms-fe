import BoardsClient from "@/components/board/BoardsClient";

export default async function BoardsPage({
  params,
}: {
  params: Promise<{
    workspaceId: string;
  }>;
}) {
  const { workspaceId } = await params;
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Boards</h2>
      </div>
      <BoardsClient workspaceId={workspaceId} />
    </div>
  );
}
