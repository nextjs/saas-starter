import Image from "next/image";

import post from "@/app/assets/image/post.png";

export default function PostContent() {
  return (
    <div className="space-y-2">
      <div className="space-y-2 text-base">
        <p>
          Binance has announced the results of the second batch of the 'Vote to
          List' and will list Ondo (ONDO), Big Time (BIGTIME), and Virtuals
          Protocol (VIRTUAL), with Seed Tags applied.
        </p>
      </div>
      <div className="w-full aspect-video max-w-lg overflow-hidden rounded-md">
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
