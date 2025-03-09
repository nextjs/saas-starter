export default function Loading() {
  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-4">
      <div className="space-y-2">
        <div className="h-8 w-[200px] bg-muted animate-pulse rounded" />
        <div className="h-4 w-[300px] bg-muted animate-pulse rounded" />
      </div>
      <div className="grid gap-4">
        <div className="h-24 w-full bg-muted animate-pulse rounded" />
        <div className="h-24 w-full bg-muted animate-pulse rounded" />
        <div className="h-24 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
} 