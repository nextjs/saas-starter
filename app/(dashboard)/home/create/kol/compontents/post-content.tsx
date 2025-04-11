import Image from "next/image";
import Markdown from "react-markdown";

import post from "@/app/assets/image/post.png";

export default function PostContent({ content }: { content?: string }) {
  return (
    <div className="space-y-2">
      <div className="space-y-2 text-base">
        <Markdown>{content}</Markdown>
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
