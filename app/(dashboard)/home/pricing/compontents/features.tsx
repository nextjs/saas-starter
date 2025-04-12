import { Check } from "lucide-react";

export default function Features() {
  return (
    <ul className="text-md space-y-2">
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>数据分析</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>YouTube总结</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>图片生成</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>文件/链接聊天</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>Deep Research</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>AI朗读</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>智简视频</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>音频转文本</span>
      </li>
    </ul>
  );
}
