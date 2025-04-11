"use client";

import Threads from "@/components/Backgrounds/Threads/Threads";
import TwitterView from "@/app/components/home/TwitterView";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/Components/Carousel/Carousel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Twitter } from "@/app/assets/svg";

import { Bot } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { useLoginDrawer } from "@/app/hooks/useLoginDrawer";
import { useXauthDialog } from "@/app/hooks/useXauthDialog";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import TwitterAuth from "./twitter-auth";

export default function HomePage() {
  const router = useRouter();
  const isLoggedIn = useAppSelector((state) => state.userReducer.isLoggedIn);
  const { openDrawer } = useLoginDrawer();

  const handleCreateKol = () => {
    if (isLoggedIn) {
      router.push("/home/create/kol");
    } else {
      openDrawer();
    }
  };

  const { openXauthDialog } = useXauthDialog();
  const params = useSearchParams();
  useEffect(() => {
    const oauth_token = params.get("oauth_token");
    if (oauth_token) {
      // 打开twitter授权弹窗
      openXauthDialog();
    }
  }, []);

  return (
    <div className="text-primary w-full h-full">
      <div className="w-full h-full">
        <div className="w-full h-full relative z-1">
          <div className="flex justify-center items-center w-full h-full flex-col space-y-6">
            <Bot className="w-16 h-16 text-muted-foreground" />
            <dl className="text-center space-y-2">
              <dt className="text-2xl font-bold">The story starts here</dt>
              <dd className="text-base text-muted-foreground">
                Simply click the button above to create your first agent.
              </dd>
            </dl>
            <Button
              className="text-md"
              variant="primary"
              onClick={handleCreateKol}
            >
              Create your first agent
            </Button>
          </div>
        </div>
      </div>
      <TwitterAuth />
    </div>
  );
}
