"use client";
import { useXauthDialog } from "@/app/hooks/useXauthDialog";
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
  getTwitterAuthCallback,
  getTwitterAuthCompleteCallback,
  getTwitterAuthLink,
  getUserInfoByTwitter,
} from "@/app/request/api";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { updateTwitterFullProfile } from "@/app/store/reducers/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Loader2 } from "lucide-react";
import { useLoginDrawer } from "@/app/hooks/useLoginDrawer";
const clearUrlParams = () => {
  const url = new URL(window.location.href);
  url.search = ""; // 清空查询参数
  window.history.replaceState({}, document.title, url.toString());
};

export default function TwitterAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { isOpen, openXauthDialog, closeXauthDialog, toggleXauthDialog } =
    useXauthDialog();
  const params = useSearchParams();
  const [authParams, setAuthParams] = useState<any>({});

  const handleTwitterAuth = async () => {
    try {
      // 获取当前的url
      const currentUrl = window.location.href;
      setIsLoading(true);
      const res = await getTwitterAuthLink({
        call_back_url: currentUrl,
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
      const res = await getTwitterAuthCallback({
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
        closeXauthDialog();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Please try again");
      clearUrlParams();
      closeXauthDialog();
    }
  };

  const handleGetUserInfoByTwitter = async (data: any) => {
    try {
      setIsLoading(true);
      const res = await getUserInfoByTwitter({
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
      closeXauthDialog();
    }
  };

  const { openDrawer } = useLoginDrawer();
  const handleTwitterAuthCompleteCallback = async (
    full_profile: any,
    data: any
  ) => {
    try {
      setIsLoading(true);
      const res = await getTwitterAuthCompleteCallback({
        app_id: params.get("app_id"),
        kol_user_id: params.get("kol_user_id"),
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
        clearUrlParams();
      } else {
        toast.error("Please try again");
        clearUrlParams();
        closeXauthDialog();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Please try again");
      clearUrlParams();
      closeXauthDialog();
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
    <Dialog open={isOpen} onOpenChange={toggleXauthDialog}>
      <DialogTrigger asChild>
        <Button className="hidden">Twitter Authorization</Button>
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
                  openDrawer();
                  closeXauthDialog();
                }}
                disabled={isLoading}
              >
                Go Login
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
