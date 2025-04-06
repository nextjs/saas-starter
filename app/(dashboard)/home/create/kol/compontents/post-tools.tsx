import {
  Bookmark,
  ChartNoAxesColumn,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
} from "lucide-react";

export default function PostTools() {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <div className="flex items-center space-x-1">
        <MessageCircle className="w-4 h-4" />
        <span>1</span>
      </div>
      <div className="flex items-center space-x-1">
        <Repeat2 className="w-4 h-4" />
        <span>4</span>
      </div>
      <div className="flex items-center space-x-1">
        <Heart className="w-4 h-4" />
        <span>6</span>
      </div>
      <div className="flex items-center space-x-1">
        <ChartNoAxesColumn className="w-4 h-4" />
        <span>8K</span>
      </div>
      <div className="flex items-center space-x-2">
        <Bookmark className="w-4 h-4" />
        <Share className="w-4 h-4" />
      </div>
    </div>
  );
}
