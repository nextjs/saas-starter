import PostUser from "./post-user";
import PostTools from "./post-tools";
import PostContent from "./post-content";
import PostTime from "./post-time";
import PostReply from "./post-reply";

export default function PreviewRepost({ content, repost, reply }: { content?: string, repost?: string, reply?: string }) {
  return (
    <div className="bg-background rounded-md p-4 space-y-4">
      <PostUser />
      <PostContent content={content} />
      <div className="border border-border rounded-md p-4 bg-foreground">
        <PostUser />
        <PostContent content={repost} />
      </div>
      <PostTime />
      <div className="w-full h-px border-b border-border"></div>
      <PostTools />
      <PostReply content={reply} />
    </div>
  );
}
