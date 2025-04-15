"use client";
import React, { useEffect, useState } from "react";
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
import { CircleIcon, Loader2 } from "lucide-react";
import { Step, useLoginDrawer } from "@/app/hooks/useLoginDrawer";

export default function TwitterAuthContent({
  completeFunction,
}: {
  completeFunction: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  // const [authParams, setAuthParams] = useState<any>({});
  const { setStep } = useLoginDrawer();
  const clearUrlParams = () => {
    const url = new URL(window.location.href);
    url.search = ""; // 清空查询参数
    window.history.replaceState({}, document.title, url.toString());
  };
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
        // setAuthParams(res.data);
        localStorage.setItem("oauth_token_secret", res.data.oauth_token_secret);
        return res.data.authorization_url;
        // if (params.get("oauth_verifier")) {
        //   handleTwitterAuthCallback();
        // }
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const goAuth = async () => {
    const authorization_url = await handleTwitterAuth();
    setIsLoading(true);
    if (authorization_url) {
      window.location.href = authorization_url;
    }
  };

  const handleTwitterAuthCallback = async () => {
    try {
      if (!localStorage.getItem("oauth_token_secret")) {
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
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      clearUrlParams();
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
      clearUrlParams();
    }
  };

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
        completeFunction(); // 完成授权后回调
      } else {
        toast.error(res.msg);
        clearUrlParams();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      clearUrlParams();
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
    <div className="w-full flex flex-col items-left justify-center gap-4">
      <div className="w-full flex items-center justify-start gap-2">
        <CircleIcon className="h-8 w-8 text-secondary" />
        <h1 className="text-xl font-bold capitalize">Twitter Authorization</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Please authorize your Twitter account to continue using.
      </p>

      <div className="w-full flex flex-col items-center justify-center gap-4 mt-4">
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
              className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10"
              onClick={completeFunction}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Go Login"
              )}
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center gap-2">
            <Twitter className="w-10 h-10 text-primary mb-4" />
            <Button
              className="w-full duration-350 h-10 flex items-center justify-center font-bold px-10"
              onClick={goAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Authorize Twitter"
              )}
            </Button>
            <Button
              variant="link"
              type="button"
              className="w-full text-left justify-start text-sm text-muted-foreground p-0"
              onClick={() => setStep(Step.Login)}
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
