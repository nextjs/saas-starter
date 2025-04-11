import Image from "next/image";

import avatar from "@/app/assets/image/avatar.png";

export default function PostReply() {
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
          <dd className="text-muted-foreground">@KOLAGEN · 5h</dd>
        </dl>
        <div className="space-y-2 pb-2">
          <p>Setting up a crypto wallet is simple.</p>
          <p>Picking the right one can shape your entire journey.</p>
        </div>
      </div>
    </div>
  );
}
