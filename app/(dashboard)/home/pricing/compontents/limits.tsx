import { Check } from "lucide-react";

export default function Limits() {
  return (
    <ul className="text-md space-y-2">
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>支持Chrome/Edge插件</span>
      </li>
      <li className="flex items-center space-x-2">
        <Check className="size-4 text-secondary" />
        <span>最多支持 8 台设备登录</span>
      </li>
    </ul>
  );
}
