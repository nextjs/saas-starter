import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { Settings } from "lucide-react";

export default function ActivityPageSkeleton() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h2 className="text-md md:text-xl font-medium text-foreground mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6 text-muted-foreground" />
        Activity Log
      </h2>
      <Card>
        <CardHeader>
          <CardTitle className="font-medium">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[88px]">
          <ActivitySkeleton />
        </CardContent>
      </Card>
    </section>
  );
}

const ActivitySkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[48px] w-1/5" />
      <Skeleton className="h-[48px] w-1/3" />
    </div>
  );
};

const Skeleton = ({ className }: { className: string }) => {
  return <div className={cn("h-[88px] w-full bg-gray-200 animate-pulse rounded-md", className)} />;
};
