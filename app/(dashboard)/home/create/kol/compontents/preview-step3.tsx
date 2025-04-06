import { LoaderCircle } from "lucide-react";

export default function PreviewStepThree() {
  return (
    <div className="px-4 space-y-4 text-md">
      <div className="bg-background rounded-md px-4 py-2 flex items-center space-x-1">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        <span>思考中…(用时22秒)</span>
      </div>
      <div className="space-y-4 border-l-2 border-secondary pl-4">
        <p>
          CZ Agent互动的用户，喜欢Layer2和web3相关的，通过X
          推特平台进行，搜索名称和描述，以及发文内容，有关于Layer2和web3的进行查找，并通过热度和时间进行排序，找到热度最高的帖子进互动和转发。此类帖子用户群体比较多，系统默认媒体转发10篇，评论10次。开始执行程序。。。。
        </p>
      </div>
      <div className="bg-background rounded-md px-4 py-2 flex items-center space-x-1">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        <span>转推中…(用时10秒) 1/2</span>
      </div>
      <div className="bg-background rounded-md px-4 py-2 flex items-center space-x-1">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        <span>转推中…(用时10秒) 2/2</span>
      </div>
      <div className="bg-background rounded-md px-4 py-2 flex items-center space-x-1">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        <span>评论中…(用时10秒) 1/2</span>
      </div>
    </div>
  );
}
