import { LoaderCircle } from "lucide-react";

export default function PreviewLoader(props: {
  text: string;
  time: number;
  progress?: string;
}) {
  const { text, time, progress } = props;

  return (
    <div className="bg-background rounded-md px-4 py-2 flex items-center space-x-1">
      <LoaderCircle className="w-4 h-4 animate-spin" />
      <span>
        {text}…(用时{time}秒) {progress}
      </span>
    </div>
  );
}
