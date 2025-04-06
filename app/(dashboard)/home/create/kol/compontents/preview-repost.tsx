import PostUser from "./post-user";
import PostTools from "./post-tools";
import PostContent from "./post-content";
import PostTime from "./post-time";
import PostReply from "./post-reply";

export default function PreviewRepost() {
  return (
    <div className="bg-background rounded-md p-4 space-y-4">
      <PostUser />
      <PostContent />
      <div className="border border-border rounded-md p-4 bg-foreground">
        <PostUser />
        <PostContent />
      </div>
      <PostTime />
      <div className="w-full h-px border-b border-border"></div>
      <PostTools />
      <PostReply />
    </div>
  );
}
