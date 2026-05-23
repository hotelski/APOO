import { MemoryDetailPage } from "@/components/memories/MemoryDetailPage";

type MemoryRouteProps = {
  params: {
    id: string;
  };
};

export default function MemoryRoute({ params }: MemoryRouteProps) {
  return <MemoryDetailPage memoryId={params.id} />;
}
