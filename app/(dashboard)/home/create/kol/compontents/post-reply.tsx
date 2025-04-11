import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import avatar from "@/app/assets/image/avatar.png";
import PostTools from "./post-tools";
import Markdown from "react-markdown";

export default function PostReply({ content }: { content?: string }) {
  const [timeAgo, setTimeAgo] = useState<string>("0s"); 
  const mountTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 格式化时间函数 - 计算从初始渲染到现在的时间
  const formatTimeAgo = (): string => {
    const now = Date.now();
    const diffMs = now - mountTimeRef.current;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    // 根据时间差返回相应的格式
    if (diffMin < 1) {
      return `${diffSec}s`; // 1分钟内，显示秒
    } else if (diffHour < 1) {
      return `${diffMin}m`; // 1小时内，显示分钟
    } else if (diffDay < 1) {
      return `${diffHour}h`; // 1天内，显示小时
    } else {
      return `${diffDay}d`; // 大于1天，显示天数
    }
  };
  
  // 更新显示的时间
  const updateTimeAgo = () => {
    setTimeAgo(formatTimeAgo());
  };
  
  // 组件加载时设置定时器，定期更新时间
  useEffect(() => {
    // 记录组件挂载时间
    mountTimeRef.current = Date.now();
    
    // 立即更新一次时间
    updateTimeAgo();
    
    // 设置定时器，每秒更新一次时间
    timerRef.current = setInterval(() => {
      updateTimeAgo();
    }, 1000);
    
    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="flex space-x-2 border-t border-border py-4">
      <div className="w-10 h-10 overflow-hidden rounded-md">
        <Image
          className="w-full h-full object-cover"
          src={avatar}
          alt="avatar"
          width={avatar.width}
          height={avatar.height}
        />
      </div>
      <div className="flex-1 w-full">
        <dl className="flex items-center text-md space-x-1">
          <dt className="font-bold">KOL Agent</dt>
          <dd className="text-muted-foreground">@KOLAGEN · {timeAgo}</dd>
        </dl>
        <div className="space-y-2 pb-2">
          <Markdown>{content}</Markdown>
        </div>
        <PostTools />
      </div>
    </div>
  );
}
