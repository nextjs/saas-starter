import PostUser from "./post-user";
import PostContent from "./post-content";
import PostTime from "./post-time";

export default function Post() {
  return (
    <div className="space-y-4">
      <PostUser />
      <PostContent />
      <PostTime />
    </div>
  );
}
