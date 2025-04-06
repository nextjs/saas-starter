import Image from "next/image";

import post from "@/app/assets/image/post.png";

export default function PostContent() {
  return (
    <div className="space-y-2">
      <div className="space-y-2 text-base">
        <p>Learn how to use KolAgent.ai</p>
      </div>
      <div className="w-full aspect-video overflow-hidden rounded-md">
        <Image
          className="w-full h-full object-cover"
          src={post}
          alt="post"
          width={post.width}
          height={post.height}
        />
      </div>
    </div>
  );
}
