import { LoaderCircle } from "lucide-react";

export default function PreviewStepTwo() {
  return (
    <div className="px-4 space-y-4 text-md">
      <div className="bg-background rounded-md px-4 py-2 flex items-center space-x-1">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        <span>思考中…(用时22秒)</span>
      </div>
      <div className="space-y-4 border-l-2 border-secondary pl-4">
        <p>
          好的，用户想要优化她创建的Agent推特账号的人物性格。她提供了很多身份信息，包括持有BNB和BTC，是BNB链社区的成员，YZiLabs的实习生，Giggle
          Academy的创始人，以及前币安创始人和CEO，同时还是一个开朗、勇敢、健谈的女科学家。
        </p>
        <p>
          首先，我需要分析这些信息，找出核心亮点。她有很多头衔，可能需要突出她的领导力和创新精神，比如作为Giggle
          Academy的创始人和币安的前CEO。同时，她的科学背景也是一个独特点，可以结合区块链和科学，塑造理性又热情的形象。
        </p>
        <p>
          接下来，考虑用户可能没直接提到的需求。她可能希望这个Agent账号不仅展示专业能力，还要有亲和力，吸引更多关注者。所以性格方面需要平衡专业与幽默，权威与亲切。
        </p>
        <p>
          然后，用户提到的开朗、勇敢、健谈，这些都是关键词，需要融入性格设定。可能还需要加入更多层次，比如好奇心、热情，或者对教育和技术结合的关注，因为Giggle
          Academy可能涉及教育领域。
        </p>
        <p>
          另外，考虑到她作为女性科学家，这在区块链领域可能相对少见，可以强调这一点，突出多样性和打破刻板印象，吸引更多女性或对科技感兴趣的用户。
          还要考虑目标受众是谁，可能是区块链爱好者、投资者、教育从业者，或者科技圈的人士。性格设定需要符合这些群体的喜好，比如使用幽默易懂的语言，分享行业见解，同时保持互动性。
          可能需要避免的信息过载，虽然有很多身份，但需要整合成一个连贯的形象，而不是简单罗列。例如，将创始人、科学家、社区成员等身份结合起来，展示一个多面但统一的个性。
          最后，检查是否有遗漏的方面，比如社会责任感，作为教育平台的创始人，可能重视知识传播，或者作为前币安CEO，关注行业发展和合规性，这些都可以成为性格的一部分。
        </p>
      </div>
      <div className="space-y-4">
        <p className="bg-background rounded-md px-4 py-2">
          来认识一下CZ Agent博士，她是一位在 Web3
          领域非常出色的关键意见领袖（KOL）。她脸上洋溢着富有感染力的笑容，只要她出现在任何场合，都会光芒四射，其开朗的性格十分引人注目。
        </p>
        <p className="bg-background rounded-md px-4 py-2">
          在整个职业生涯中，CZ Agent 博士的勇敢展露无遗。她毫无畏惧地深入探索
          Web3
          领域中那些未知的领域，对于复杂且常常被误解的概念也毫不退缩。无论是挑战传统金融模式…
        </p>
      </div>
    </div>
  );
}
