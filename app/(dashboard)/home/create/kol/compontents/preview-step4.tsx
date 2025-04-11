import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/app/store/hooks";
import { chat } from "@/app/request/api";
import { handleSSEResponse } from "@/app/utils/api";
import PreviewLoader from "./preview-loader";
import PreviewThinking from "./preview-thinking";
import PreviewPost from "./preview-post";
import Markdown from "react-markdown";

// 定义消息结构
interface Message {
  tweet: string;
  reasoningContent?: string;
}

export default function PreviewStepFour() {
  const Step1 = useAppSelector((state: any) => state.userReducer.from.step1);
  const Step2 = useAppSelector((state: any) => state.userReducer.from.step2);
  const Step3 = useAppSelector((state: any) => state.userReducer.from.step3);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [partialTweet, setPartialTweet] = useState<string>("");
  const [partialReasoning, setPartialReasoning] = useState<string>("");
  const initializedRef = useRef<boolean>(false);

  const language = useAppSelector((state: any) => state.userReducer.config.language);

  // 构建提示信息
  const buildPrompt = () => {
    let prompt = 'Please generate a Twitter post for a KOL. ';
    
    // 添加KOL基本信息 (Step1)
    if (Step1.name) prompt += `The KOL's name is ${Step1.name}. `;
    if (Step1.gender) prompt += `They are a ${Step1.gender}. `;
    if (Step1.character) prompt += `They have a ${Step1.character} personality. `;
    
    // 添加KOL能力和特征 (Step2)
    if (Step2.ability) {
      prompt += `They have the following abilities: ${Step2.ability}. `;
    }

    const languageName = language.find((item: any) => item.id === Step1.language)?.name;
    if (languageName) {
      prompt += `The KOL speaks ${languageName}. `;
    }
    
    // 添加互动要求 (Step3)
    if (Step3.interactive) {
      prompt += `They should interact with users interested in: ${Step3.interactive}. `;
    }
    
    // 明确生成内容的要求
    prompt += `Generate a tweet that reflects their personality and interests.`;
    
    return prompt;
  };

  const generateTweet = async () => {
    try {
      setLoading(true);
      setPartialTweet("");
      setPartialReasoning("");

      const prompt = buildPrompt();
      const response: any = await chat({
        messages: [
          {
            content: prompt,
            role: "user",
          },
        ],
      });

      const { content, reasoningContent } = await handleSSEResponse(
        response,
        (text: string, reasoningText: string) => {
          setPartialTweet(text);
          setPartialReasoning(reasoningText);
        }
      );

      setMessage({
        tweet: content,
        reasoningContent: reasoningContent,
      });
    } catch (error) {
      console.error("Failed to generate tweet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    generateTweet();
  }, [Step1, Step2, Step3]);

  return (
    <div className="px-4 space-y-4 text-md">
      {/* 显示思考过程 */}
      {(loading || message?.reasoningContent) && (
        <>
          <PreviewLoader 
            text={loading ? "Thinking..." : "Thought process:"}
            isThinking={loading && !partialTweet} 
          />
          <PreviewThinking 
            texts={loading ? partialReasoning : (message?.reasoningContent || "")} 
          />
        </>
      )}
      
      {/* 显示推文 */}
      {message?.tweet && (
        <>
          <PreviewLoader 
            text="Generated Tweet:" 
            isThinking={false} 
          />
          <PreviewPost content={message.tweet} />
        </>
      )}
      
      {/* 显示加载状态或空状态 */}
      {!loading && !message && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p>Waiting for data from previous steps</p>
          <p className="text-sm">Please complete Steps 1-3 to generate content</p>
        </div>
      )}
    </div>
  );
}
