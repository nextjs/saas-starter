"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Twitter } from "@/app/assets/svg";
import { Button } from "@/components/ui/button";
import {
  createAgent,
  getCreateTwitterAuthCallback,
  getCreateTwitterAuthCompleteCallback,
  getCreateTwitterAuthLink,
  getCreateUserInfoByTwitter,
} from "@/app/request/api";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { updateTwitterFullProfile } from "@/app/store/reducers/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Loader2 } from "lucide-react";
import { useLoginDrawer } from "@/app/hooks/useLoginDrawer";
import { CreateAgentRequest } from "@/app/types/types";
import { useCreateXauthDialog } from "@/app/hooks/useCreateXauthDialog";
const clearUrlParams = () => {
  const url = new URL(window.location.href);
  url.search = ""; // 清空查询参数
  window.history.replaceState({}, document.title, url.toString());
};

export default function CreateTwitterAuth({
  setTwitterAuth,
  showName = "Connect",
}: {
  setTwitterAuth: (isTwitterAuth: boolean) => void;
  showName?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const {
    isOpen,
    openCreateXauthDialog,
    closeCreateXauthDialog,
    toggleCreateXauthDialog,
  } = useCreateXauthDialog();
  const params = useSearchParams();
  const [authParams, setAuthParams] = useState<any>({});
  const from = useAppSelector((state: any) => state.userReducer.from);
  const kols = useAppSelector((state: any) => state.userReducer.config.kols);
  const ability = useAppSelector(
    (state: any) => state.userReducer.config.ability
  );

  const createAgentGetId = async () => {
    try {
      const data: CreateAgentRequest = {
        ability: from.step2.ability
          .split("\n")
          .map(
            (item: string) => ability.find((kol: any) => kol.desc === item).id
          ),
        character: from.step1.character
          .split(",")
          .filter((character: string) => character.trim() !== "")
          .join("|"),
        comment: from.step5.comment,
        interactive: from.step3.interactive
          .split(",")
          .map((item: string) => kols.find((kol: any) => kol.name === item).id),
        language: from.step1.language,
        likes: from.step5.likes,
        repost: from.step5.repost,
        name: from.step1.name,
        posts: from.step5.post,
        quote: from.step5.quote,
        receive_address: from.step6.address,
        region: from.step1.region,
        reply: from.step5.reply,
        sex: from.step1.gender,
        topics: from.step4.topics
          .split(",")
          .filter((topic: string) => topic.trim() !== "")
          .join("|"),
      };
      console.log("create data::", data);
      const res = await createAgent(data);
      if (res && res.code === 200) {
        return res.data.id;
      } else {
        toast.error("Please try again");
        closeCreateXauthDialog();
        return "";
      }
    } catch (error) {
      console.log(error);
      toast.error("Please try again");
      closeCreateXauthDialog();
      return "";
    }
  };

  const handleTwitterAuth = async () => {
    try {
      const agentId = await createAgentGetId();
      if (!agentId) {
        return;
      }
      // 获取当前的url
      const currentUrl = window.location.href;
      setIsLoading(true);
      const res = await getCreateTwitterAuthLink({
        call_back_url: currentUrl,
        agent_id: agentId,
      });
      setIsLoading(false);
      if (res && res.code === 200) {
        setAuthParams(res.data);
        localStorage.setItem("oauth_token_secret", res.data.oauth_token_secret);
        if (params.get("oauth_verifier")) {
          handleTwitterAuthCallback();
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Please try again");
    }
  };

  const goAuth = () => {
    window.location.href = authParams.authorization_url;
  };

  useEffect(() => {
    const oauth_token = params.get("oauth_token");
    if (!oauth_token && isOpen) {
      handleTwitterAuth();
    }
  }, [isOpen]);

  const handleTwitterAuthCallback = async () => {
    try {
      if (!localStorage.getItem("oauth_token_secret")) {
        toast.error("Please try again");
        return;
      }
      setIsLoading(true);
      const res = await getCreateTwitterAuthCallback({
        oauth_token: params.get("oauth_token"),
        oauth_token_secret: localStorage.getItem("oauth_token_secret"),
        oauth_verifier: params.get("oauth_verifier"),
        app_id: params.get("app_id"),
      });
      setIsLoading(false);
      if (res && res.code === 200) {
        handleGetUserInfoByTwitter(res.data);
      } else {
        toast.error("Please try again");
        clearUrlParams();
        closeCreateXauthDialog();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Please try again");
      clearUrlParams();
      closeCreateXauthDialog();
    }
  };

  const handleGetUserInfoByTwitter = async (data: any) => {
    try {
      setIsLoading(true);
      const res = await getCreateUserInfoByTwitter({
        access_token: data.oauth_token,
        access_token_secret: data.oauth_token_secret,
        app_id: params.get("app_id"),
      });
      setIsLoading(false);
      if (res && res.code === 200) {
        handleTwitterAuthCompleteCallback(res.data.full_profile, data);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Please try again");
      clearUrlParams();
      closeCreateXauthDialog();
    }
  };

  const handleTwitterAuthCompleteCallback = async (
    full_profile: any,
    data: any
  ) => {
    try {
      setIsLoading(true);
      const res = await getCreateTwitterAuthCompleteCallback({
        app_id: params.get("app_id"),
        agent_id: params.get("agent_id"),
        oauth_token: data.oauth_token,
        user_id: full_profile.id,
        screen_name: full_profile.screen_name,
        oauth_token_secret: data.oauth_token_secret,
        profile_image_url_https: full_profile.profile_image_url_https,
      });
      setIsLoading(false);
      if (res && res.code === 200) {
        toast.success("Twitter authorization successful");
        await dispatch(updateTwitterFullProfile(full_profile));
      } else {
        toast.error("Please try again");
        clearUrlParams();
        closeCreateXauthDialog();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Please try again");
      clearUrlParams();
      closeCreateXauthDialog();
    }
  };

  useEffect(() => {
    const oauth_token = params.get("oauth_token");
    const oauth_verifier = params.get("oauth_verifier");
    if (oauth_token && oauth_verifier) {
      handleTwitterAuthCallback();
    }
  }, [params]);

  const twitterFullProfile = useAppSelector(
    (state: any) => state.userReducer.twitter_full_profile
  );

  return (
    <Dialog open={isOpen} onOpenChange={toggleCreateXauthDialog}>
      <DialogTrigger asChild>
        <Button className="duration-350 flex items-center justify-center font-bold">
          {showName}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-xs min-w-[200px] text-primary">
        <DialogHeader>
          <DialogTitle>
            <h1 className="text-xl font-bold text-center">
              Twitter Authorization
            </h1>
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col items-center justify-center gap-4">
          {twitterFullProfile && Object.keys(twitterFullProfile).length > 0 ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 overflow-hidden rounded-full">
                <img
                  src={twitterFullProfile.profile_image_url_https}
                  alt="twitter"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-md font-bold">
                  {twitterFullProfile.name}
                </span>
                <span className="text-sm text-gray-500">
                  {twitterFullProfile.screen_name}
                </span>
              </div>
              <Button
                className="w-20 h-8"
                onClick={() => {
                  clearUrlParams();
                  setTwitterAuth(true);
                  closeCreateXauthDialog();
                }}
                disabled={isLoading}
              >
                Confirm
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <Twitter className="w-10 h-10 text-primary" />
              <Button
                className="w-20 h-8"
                onClick={goAuth}
                disabled={isLoading}
              >
                <span className="text-sm font-bold">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Authorize"
                  )}
                </span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
