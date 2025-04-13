import { Check } from "lucide-react";

export default function Features(props: { data: number[] }) {
  const { data } = props;

  return (
    <div className="p-4">
      <ul className="text-md space-y-4 text-muted-foreground">
        <li className="flex items-center justify-between space-x-2">
          <span>创建Agent个数</span>
          <span className="font-bold">{data[0]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>发推</span>
          <span className="font-bold">{data[1]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>转推</span>
          <span className="font-bold">{data[2]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>引用</span>
          <span className="font-bold">{data[3]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>评论</span>
          <span className="font-bold">{data[4]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>回复</span>
          <span className="font-bold">{data[5]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>点赞</span>
          <span className="font-bold">{data[6]}</span>
        </li>
        <li className="flex items-center justify-between space-x-2">
          <span>每日处理广告商发推数量</span>
          <span className="font-bold">{data[7]}</span>
        </li>
      </ul>
    </div>
  );
}
