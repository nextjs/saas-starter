import { ScrollArea } from "@/components/ui/scroll-area";
import Image, { StaticImageData } from "next/image";
import clsx from "clsx";

import avatar from "@/app/assets/image/avatar.png";
import Post from "../compontents/post";
import Repost from "../compontents/repost";
import Reply from "../compontents/reply";
export default function page() {
  return (
    <div className="w-full h-full">
      <ScrollArea className="w-full h-full">
        <div className="space-y-8 pb-1">
          <div className="flex space-x-4">
            <div className="min-w-8 size-8 rounded-full overflow-hidden">
              <Image src={avatar} alt="avatar" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <dl className="flex items-baseline space-x-2">
                <dt className="text-base font-bold leading-8">John Doe</dt>
                <dd className="text-md text-muted-foreground">
                  2025-03-28 10:00
                </dd>
              </dl>
              <div className="text-md text-muted-foreground bg-foreground shadow-sm rounded-md p-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Quisquam, quos.
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="min-w-8 size-8 rounded-full overflow-hidden">
              <Image src={avatar} alt="avatar" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <dl className="flex items-baseline space-x-2">
                <dt className="text-base font-bold leading-8">John Doe</dt>
                <dd className="text-md text-muted-foreground">
                  2025-03-28 10:00
                </dd>
              </dl>
              <div className="text-md text-muted-foreground bg-foreground shadow-sm rounded-md p-4">
                Our extension is safe and available on the official Chrome Web
                Store, meeting all security standards. We prioritize your
                privacy and do not collect personal data without your consent.
                Regular updates keep it secure and efficient. All data is
                encrypted to protect your safety. You can also review the
                manifest.json file to confirm that your cookies are not accessed
                without permission.
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="min-w-8 size-8 rounded-full overflow-hidden">
              <Image src={avatar} alt="avatar" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <dl className="flex items-baseline space-x-2">
                <dt className="text-base font-bold leading-8">John Doe</dt>
                <dd className="text-md text-muted-foreground">
                  2025-03-28 10:00
                </dd>
              </dl>
              <div className="text-md text-muted-foreground bg-foreground shadow-sm rounded-md p-4">
                来自于XXX的广告上合作需求，已付款100USDT，付款时间2025年3月28日，平台获取20%佣金，20USDT，您可以获取80USDT，项目名称“xxx”,项目介绍“xxxx”
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="min-w-8 size-8 rounded-full overflow-hidden">
              <Image src={avatar} alt="avatar" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <dl className="flex items-baseline space-x-2">
                <dt className="text-base font-bold leading-8">John Doe</dt>
                <dd className="text-md text-muted-foreground">
                  2025-03-28 10:00
                </dd>
              </dl>
              <div className="text-md text-muted-foreground bg-foreground shadow-sm rounded-md p-4">
                <Post />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="min-w-8 size-8 rounded-full overflow-hidden">
              <Image src={avatar} alt="avatar" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <dl className="flex items-baseline space-x-2">
                <dt className="text-base font-bold leading-8">John Doe</dt>
                <dd className="text-md text-muted-foreground">
                  2025-03-28 10:00
                </dd>
              </dl>
              <div className="text-md text-muted-foreground bg-foreground shadow-sm rounded-md p-4">
                <Repost />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="min-w-8 size-8 rounded-full overflow-hidden">
              <Image src={avatar} alt="avatar" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <dl className="flex items-baseline space-x-2">
                <dt className="text-base font-bold leading-8">John Doe</dt>
                <dd className="text-md text-muted-foreground">
                  2025-03-28 10:00
                </dd>
              </dl>
              <div className="text-md text-muted-foreground bg-foreground shadow-sm rounded-md p-4">
                <Reply />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
