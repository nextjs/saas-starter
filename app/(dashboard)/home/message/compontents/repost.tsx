import PostUser from "./post-user";
import PostContent from "./post-content";
import PostTime from "./post-time";

export default function Repost() {
  return (
    <div className="space-y-4">
      <PostUser />
      <PostContent />
      <div className="border border-border rounded-md p-4 bg-foreground">
        <PostUser />
        <PostContent />
      </div>
      <PostTime />
    </div>
  );
}
