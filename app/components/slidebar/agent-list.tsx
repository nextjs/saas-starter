"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import clsx from "clsx";

import avatar from "@/app/assets/image/avatar.png";

const AgentItem = (props: {
  agentId: string;
  name: string;
  avatar: StaticImageData;
  description: string;
}) => {
  const { agentId, name, avatar, description } = props;
  const router = useRouter();
  const pathname = usePathname();

  const [isActive, setIsActive] = useState<boolean>(false);

  const handleClick = () => {
    router.push(`/home/message/${agentId}`);
  };

  useEffect(() => {
    const isActive = pathname === `/home/message/${agentId}`;

    console.log(pathname, `/home/message/${agentId}`);

    setIsActive(isActive);
  }, [pathname, agentId]);

  return (
    <li
      className={clsx(
        "flex items-center space-x-2 overflow-hidden rounded-md p-2 cursor-pointer bg-background group",
        isActive
          ? "text-foreground bg-gradient-to-r from-[#0bbdb6] to-[#00d179] hover:bg-gradient-to-r hover:from-[#0bbdb6] hover:to-[#00d179]"
          : "hover:text-foreground hover:bg-gradient-to-r hover:from-[#0bbdb6]/90 hover:to-[#00d179]/90"
      )}
      onClick={handleClick}
    >
      <div className="w-10 min-w-10 h-10 rounded-full overflow-hidden">
        <Image src={avatar} alt="avatar" className="w-10 h-10" />
      </div>
      <dl className="flex-1 w-full overflow-hidden">
        <dt className="text-md truncate">{name}</dt>
        <dd
          className={clsx(
            "text-sm truncate text-md group-hover:text-foreground",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {description}
        </dd>
      </dl>
    </li>
  );
};

export default function AgentList() {
  return (
    <ul className="space-y-2">
      <AgentItem
        agentId="12345"
        name="AI"
        avatar={avatar}
        description="Open rednote Open rednoteOpen rednote"
      />
      <AgentItem
        agentId="67890"
        name="Reddit"
        avatar={avatar}
        description="Open reddit Open reddit Open reddit"
      />
    </ul>
  );
}
