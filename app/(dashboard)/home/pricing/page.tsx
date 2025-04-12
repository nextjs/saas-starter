import Star from "@/app/assets/svg/star.svg";

import Tab from "./compontents/tab";
import Subscribe from "./compontents/subscribe";
import Features from "./compontents/features";
import Limits from "./compontents/limits";

export default function page() {
  return (
    <div className="w-full h-auto p-12">
      <div className="flex flex-col items-center max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col justify-center items-center space-y-4 text-center">
          <h3 className="text-4xl font-semibold">
            Sider: 提供一站式人工智能服务
          </h3>
          <p className="text-xl text-muted-foreground break-all">
            支持 o3-mini & o1, DeepSeek, GPT-4o, Claude 3.5 Sonnet
          </p>
        </div>
        <div className="flex justify-center items-center gap-x-16 gap-y-4 text-center text-base">
          <dl>
            <dt className="text-xl font-bold">4.9</dt>
            <dd className="flex items-center space-x-0.5">
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </dd>
          </dl>
          <dl>
            <dt className="text-xl font-bold">100K+</dt>
            <dd>5星好评</dd>
          </dl>
          <dl>
            <dt className="text-xl font-bold">10M+</dt>
            <dd>活跃用户</dd>
          </dl>
        </div>
        <Tab />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <div className="shadow-md rounded-md p-4 bg-foreground space-y-4 overflow-hidden border border-border hover:border-secondary transition-colors">
            <Subscribe
              title="基础版"
              price="¥49.9"
              yearPrice="¥599"
              discount="29%"
            />
            <div className="h-px w-full bg-border"></div>
            <Features />
            <div className="h-px w-full bg-border"></div>
            <Limits />
          </div>
          <div className="shadow-md rounded-md p-4 bg-foreground space-y-4 overflow-hidden border border-border hover:border-secondary transition-colors">
            <Subscribe
              title="至尊版"
              price="¥116.6"
              yearPrice="¥1,399"
              discount="44%"
            />
            <div className="h-px w-full bg-border"></div>
            <Features />
            <div className="h-px w-full bg-border"></div>
            <Limits />
          </div>
          <div className="shadow-md rounded-md p-4 bg-foreground space-y-4 overflow-hidden border border-border hover:border-secondary transition-colors">
            <Subscribe
              title="高级版"
              price="¥83.3"
              yearPrice="¥999"
              discount="41%"
            />
            <div className="h-px w-full bg-border"></div>
            <Features />
            <div className="h-px w-full bg-border"></div>
            <Limits />
          </div>
        </div>
      </div>
    </div>
  );
}
