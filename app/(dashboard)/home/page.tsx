"use client";

import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { useLoginDrawer } from "@/app/hooks/useLoginDrawer";
import { useEffect } from "react";
import { toast } from "sonner";
export default function HomePage() {
  const router = useRouter();
  const isLoggedIn = useAppSelector((state) => state.userReducer.isLoggedIn);
  const { openDrawer } = useLoginDrawer();
  const userInfoDetails = useAppSelector((state) => state.userReducer.userInfo.details);

  const handleCreateKol = () => {
    if (isLoggedIn && userInfoDetails.agent.created < userInfoDetails.agent.total) {
      router.push("/home/create/kol");
    } else if (isLoggedIn && userInfoDetails.agent.created >= userInfoDetails.agent.total) {
      toast.warning("Create agent has reached the limit");
    } else {
      openDrawer();
    }
  };

  const params = useSearchParams();
  useEffect(() => {
    const oauth_token = params.get("oauth_token");
    if (oauth_token) {
      // 打开登录 twitter授权弹窗
      openDrawer();
    }
  }, [params]);

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
    </div>
  );
}
