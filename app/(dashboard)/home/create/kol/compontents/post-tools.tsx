import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import CountUp from "@/app/components/comm/CountUp";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function PostTools() {
  // 生成1-10之间的随机数
  const commentCount = Math.floor(Math.random() * 10) + 1;
  const retweetCount = Math.floor(Math.random() * 10) + 1;

  // CountUp 累加效果状态
  const [heartCurrentCount, setHeartCurrentCount] = useState<number>(0);
  const [heartNextCount, setHeartNextCount] = useState<number>(6);
  const [heartKey, setHeartKey] = useState<number>(0);

  const [viewCurrentCount, setViewCurrentCount] = useState<number>(0);
  const [viewNextCount, setViewNextCount] = useState<number>(0);
  const [viewKey, setViewKey] = useState<number>(0);

  // 定时器引用
  const heartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 处理喜欢计数结束的函数
  const handleHeartCountEnd = () => {
    if (heartTimerRef.current) {
      clearTimeout(heartTimerRef.current);
    }

    heartTimerRef.current = setTimeout(() => {
      // 生成1-10之间的随机数
      const randomIncrement = Math.floor(Math.random() * 10) + 1;

      // 更新当前计数为之前的nextCount
      setHeartCurrentCount(heartNextCount);

      // 计算新的nextCount
      setHeartNextCount(heartNextCount + randomIncrement);

      // 更新key以强制重新渲染CountUp组件
      setHeartKey((prevKey) => prevKey + 1);

      heartTimerRef.current = null;
    }, 3000); // 3秒延迟
  };

  // 处理查看计数结束的函数
  const handleViewCountEnd = () => {
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
    }

    viewTimerRef.current = setTimeout(() => {
      // 生成0-20之间的随机数
      const randomIncrement = Math.floor(Math.random() * 100); // 0-20的随机数

      // 更新当前计数为之前的nextCount
      setViewCurrentCount(viewNextCount);

      // 计算新的nextCount
      setViewNextCount(viewNextCount + randomIncrement);

      // 更新key以强制重新渲染CountUp组件
      setViewKey((prevKey) => prevKey + 1);

      viewTimerRef.current = null;
    }, 2500); // 2.5秒延迟
  };

  // 组件初始化时启动查看计数
  useEffect(() => {
    // 初始化时立即开始第一次查看计数变化
    handleViewCountEnd();

    // 组件卸载时清除所有定时器
    return () => {
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <div className="flex items-center space-x-1">
        <MessageCircle className="w-4 h-4" />
        <span>{commentCount}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Repeat2 className="w-4 h-4" />
        <span>{retweetCount}</span>
      </div>
      <div className="flex items-center space-x-1">
        <div className="relative inline-flex items-center justify-center">
          {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
            <DotLottieReact
              className="w-[100px]"
              src="/lottie/like-click.lottie"
              loop
              autoplay
            />
          </div> */}
          {/* <div className="w-4 h-4 relative">
            <DotLottieReact
              className="w-10 h-10 absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/3 pointer-events-none"
              src="/lottie/like-click.lottie"
              loop
              autoplay
            />
          </div> */}
          <Heart className="w-4 h-4 relative z-10" />
        </div>
        <CountUp
          key={heartKey}
          from={heartCurrentCount}
          to={heartNextCount}
          separator=","
          direction="up"
          duration={1}
          className="count-up-text relative z-10"
          onEnd={handleHeartCountEnd}
        />
      </div>
      <div className="flex items-center space-x-1 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 pointer-events-none z-[0]">
          <DotLottieReact
            className="w-[100px]"
            src="/lottie/fire-2.lottie"
            loop
            autoplay
          />
        </div>
        <ChartNoAxesColumn className="w-4 h-4 relative z-10" />
        <CountUp
          key={viewKey}
          from={viewCurrentCount}
          to={viewNextCount}
          separator=","
          direction="up"
          duration={1}
          className="count-up-text relative z-10"
          onEnd={handleViewCountEnd}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Bookmark className="w-4 h-4" />
        <Share className="w-4 h-4" />
      </div>
    </div>
  );
}
