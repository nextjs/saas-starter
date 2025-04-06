import PreviewLoader from "./preview-loader";
import PreviewThinking from "./preview-thinking";

const texts = [
  "CZ Agent互动的用户，喜欢Layer2和web3相关的，通过X 推特平台进行，搜索名称和描述，以及发文内容，有关于Layer2和web3的进行查找，并通过热度和时间进行排序，找到热度最高的帖子进互动和转发。此类帖子用户群体比较多，系统默认媒体转发10篇，评论10次。开始执行程序",
];

export default function PreviewStepThree() {
  return (
    <div className="px-4 space-y-4 text-md">
      <PreviewLoader text="思考中" time={22} />
      <PreviewThinking texts={texts} />
      <PreviewLoader text="转推中" time={10} progress="1/2" />
      <PreviewLoader text="评论中" time={10} progress="1/2" />
    </div>
  );
}
