import PostUser from "./post-user";
import PostContent from "./post-content";
import PostTime from "./post-time";
import PostReply from "./post-reply";

export default function Reply() {
  return (
    <div className="space-y-4">
      <PostUser />
      <PostContent />
      <PostTime />
      <div>
        <PostReply />
        <PostReply />
        <PostReply />
        <PostReply />
        <PostReply />
      </div>
    </div>
  );
}
