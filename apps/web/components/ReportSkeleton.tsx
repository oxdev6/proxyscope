import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ReportSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-5">
        <Card title="Contract">
          <div className="space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </Card>
        <Card title="Proxy metadata">
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </Card>
        <Card title="Analysis notes">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>

      <div className="space-y-6 lg:col-span-7">
        <Card title="Risk assessment">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
        <Card title="Governance topology">
          <div className="space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="ml-6 h-14 w-[calc(100%-1.5rem)]" />
            <Skeleton className="ml-12 h-14 w-[calc(100%-3rem)]" />
          </div>
        </Card>
      </div>
    </div>
  );
}

