
import { CircleCheckBig, CircleDashed, CircleX, LoaderCircle } from 'lucide-react'
import React from 'react'
import { formatDate } from '@/app/utils/date-utils'
import { Skeleton } from '@/components/ui/skeleton'
export default function OrderSkeleton() {
  return (
    <div className="w-full p-3 rounded-lg bg-foreground shadow-sm flex flex-col gap-2 cursor-pointer">
      <div className="w-full flex items-center justify-between border-b border-dashed pb-2">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-4" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
            <span className="text-sm font-bold">
              <Skeleton className="w-10 h-4" />
            </span>
            <span className="text-sm text-muted-foreground">
              <Skeleton className="w-10 h-4" />
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <Skeleton className="w-14 h-4" />
        </div>
      </div>
      <div className="w-full grid grid-cols-24 gap-2">
        <div className="col-span-4 w-full flex flex-col gap-1 items-center justify-center p-1">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-20 h-6" />
        </div>
        <div className="col-span-6 w-full flex flex-col gap-1 items-center justify-center p-1">
          <Skeleton className="w-20 h-3" />
          <div className="text-lg w-full h-full flex items-center justify-center">
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="flex items-end justify-center text-md mt-auto">
            <Skeleton className="w-20 h-2" />
          </div>
        </div>
        <div className="col-span-10 w-full flex flex-col gap-1 items-start justify-center p-1">
          <div className="text-md w-full h-full flex flex-col gap-1">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-[80%] h-3" />
            <Skeleton className="w-[60%] h-3" />
          </div>
        </div>
        <div className="col-span-4 w-full flex flex-col gap-1 items-end justify-center p-1">
          <Skeleton className="w-14 h-4" />
        </div>
      </div>
    </div>
  )
}
