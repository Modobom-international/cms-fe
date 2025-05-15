import BoardsClient from "@/components/board/BoardsClient";

interface Board {
  id: number;
  title: string;
  description: string;
}

// TODO: Replace with actual API call
async function getBoards(): Promise<Board[]> {
  return [
    {
      id: 1,
      title: "Project Alpha",
      description: "Main project board",
    },
    {
      id: 2,
      title: "Sprint Planning",
      description: "Sprint planning and tracking",
    },
  ];
}

export default async function BoardsPage({
  params,
}: {
  params: Promise<{
    workspaceId: string;
  }>;
}) {
  const { workspaceId } = await params;
  const boards = await getBoards();

  return <BoardsClient workspaceId={workspaceId} boards={boards} />;
}
