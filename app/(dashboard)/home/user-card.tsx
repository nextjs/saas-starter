"use client";
import { Sparkles, LogOut, Info, CircleHelp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import QueryMask from "@/app/components/comm/QueryMask";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { updateIsLoggedIn } from "@/app/store/reducers/userSlice";
import { getUserInfo } from "@/app/request/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const UserInfoSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full flex flex-col gap-1">
        <div className="w-full h-full flex items-center justify-between text-sm">
          <span className="">Usage</span>
          <div className="flex items-center gap-1 text-gray-500">
            <span>
              <Skeleton className="h-4 w-[100px]" />
            </span>
          </div>
        </div>
        <div className="w-full">
          <Skeleton className="h-1 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
export default function UserCard() {
  const [progress, setProgress] = useState(50);
  const dispatch = useAppDispatch();
  const [userInfo, setUserInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const isLoggedIn = useAppSelector(
    (state: any) => state.userReducer.isLoggedIn
  );
  const getInfo = async () => {
    try {
      setIsLoading(true);
      const res: any = await getUserInfo();
      setIsLoading(false);
      if (res && res.code === 200) {
        setUserInfo(res.data);
        const data = res.data;
        const progress =
          parseInt(data.agent.created / data.agent.total + "") * 100;
        setProgress(progress);
      } else {
        toast.error(res.msg);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      getInfo();
    }
  }, [isLoggedIn]);
  return (
    <div className="w-full flex flex-col gap-2">
      <Link href="/home/pricing">
        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-2 relative my-2"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-bold">Upgrade Now</span>
          <div className="absolute z-[-1] -inset-0.5 bg-gradient-to-r from-sky-400 to-fuchsia-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        </Button>
      </Link>
      {isLoading ? (
        <UserInfoSkeleton />
      ) : (
        <div className="w-full flex flex-col gap-1">
          <div className="w-full flex flex-col gap-1">
            <div className="w-full h-full flex items-center justify-between text-sm">
              <span className="">Usage</span>
              <div className="flex items-center gap-1 text-gray-500">
                <span>
                  {userInfo?.agent?.created} / {userInfo?.agent?.total}
                </span>
                <QueryMask>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleHelp className="h-3 w-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to library</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </QueryMask>
              </div>
            </div>
            <div className="w-full">
              <Progress value={progress} className="w-full h-1" />
            </div>
          </div>
          <div className="w-full h-full rounded-lg bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src=""
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div> */}
                <div className="flex flex-col gap-0">
                  <span className="text-sm">{userInfo?.user_name}</span>
                  <span className="text-xs text-gray-500">
                    {userInfo?.current_member?.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LogOut
                  className="h-3 w-3 text-gray-400 cursor-pointer"
                  onClick={() => dispatch(updateIsLoggedIn(false))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
