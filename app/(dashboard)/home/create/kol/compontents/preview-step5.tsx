import PreviewLoader from "./preview-loader";
import PreviewThinking from "./preview-thinking";
import PreviewPost from "./preview-post";

const texts = [
  "CZ Agent发表话题关键次有：Layer2、Web3、RWA，发表的内容应该与Layer2、Web3、RWA行业相关，通过搜索该行业最新热点，撰写每日热点内容，发布话带有#Layer2、#Web3、#RWA标签",
  "CZ Agent发表话题关键次有：Layer2、Web3、RWA，发表的内容应该与Layer2、Web3、RWA行业相关，通过搜索该行业最新热点，撰写每日热点内容，发布话带有#Layer2、#Web3、#RWA标签",
];

export default function PreviewStepFive() {
  return (
    <div className="px-4 space-y-4 text-md">
      <PreviewLoader text="思考中" time={22} />
      <PreviewThinking texts={texts} />
      <PreviewLoader text="发推中" time={10} progress="1/2" />
      <PreviewPost />
    </div>
  );
}
