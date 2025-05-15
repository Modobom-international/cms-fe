import BoardClient from "@/components/board/BoardClient";

export default async function BoardPage({
  params,
}: {
  params: Promise<{
    workspaceId: string;
    boardId: string;
  }>;
}) {
  const { boardId } = await params;
  return <BoardClient boardId={Number(boardId)} />;
}

