"use client";
import { chat } from "@/app/request/api";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { handleSSEResponse } from "@/app/utils/api";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { clearFrom } from "@/app/store/reducers/userSlice";
import PreviewThinking from "./preview-thinking";
import PreviewLoader from "./preview-loader";
import Markdown from "react-markdown";

// 定义消息结构，包含内容和思考过程
interface Message {
  content: string;
  reasoningContent?: string;
}

export default function PreviewStepTwo() {
  const Step1 = useAppSelector((state: any) => state.userReducer.from.step1);
  const Step2 = useAppSelector((state: any) => state.userReducer.from.step2);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [partialOutput, setPartialOutput] = useState<string>("");
  const [partialReasoning, setPartialReasoning] = useState<string>("");
  const dispatch = useAppDispatch();
  const language = useAppSelector((state: any) => state.userReducer.config.language);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<any>(null);
  const initializedRef = useRef<boolean>(false);

  // 检查是否有足够的信息可以生成描述
  const hasEnoughInfo = () => {
    // 检查Step2是否存在且有值
    if (!Step2 || Object.keys(Step2).length === 0) return false;

    // 至少需要一个非空的字段
    return Object.values(Step2).some(
      (value) => value !== undefined && value !== null && value !== ""
    );
  };

  // 构建提示信息，结合Step1和Step2的值
  const buildPrompt = () => {
    let prompt =
      "Please create a comprehensive personality profile for my KOL agent, ";

    // 添加名称（如果有）
    if (Step1?.name && Step1.name.trim() !== "") {
      prompt += `named ${Step1.name}, `;
    } else {
      prompt += "who ";
    }

    // 添加Step1的基本信息
    const basicInfo = [];

    if (Step1?.gender) {
      basicInfo.push(`is a ${Step1.gender}`);
    }

    const regionName = Step1?.region
      ? typeof Step1.region === "object"
        ? Step1.region.name
        : Step1.region
      : "";
    if (regionName) {
      basicInfo.push(`from ${regionName}`);
    }

    if (Step1?.character && Step1.character.trim() !== "") {
      basicInfo.push(`with ${Step1.character} character`);
    }

    const languageName = language.find((item: any) => item.id === Step1.language)?.name;
    if (languageName) {
      basicInfo.push(`speaking ${languageName}`);
    }

    if (basicInfo.length > 0) {
      prompt += basicInfo.join(", ") + ". ";
    }

    // 添加Step2的详细性格特征
    prompt += "Based on the following personality traits and background: ";

    // 转换Step2对象为字符串描述
    const traits = Object.entries(Step2)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, " $1").toLowerCase()}: ${value}`
      )
      .join("; ");

    if (traits) {
      prompt += traits + ". ";
    }

    // 添加请求生成内容的指示
    prompt += `Please create a detailed personality profile that captures their essence, writing style, tone, and key characteristics. Divide the response into multiple paragraphs focusing on different aspects of their personality.`;

    return prompt;
  };

  const generateDescription = async () => {
    try {
      // 检查是否至少有一些内容可以生成
      if (!hasEnoughInfo()) {
        console.log("没有足够的信息可以生成描述");
        return;
      }

      setLoading(true);
      setPartialOutput("");
      setPartialReasoning("");

      const prompt = buildPrompt();
      console.log("生成提示:", prompt);

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
          setPartialOutput(text);
          setPartialReasoning(reasoningText);
        }
      );

      console.log("生成的对话:", content);
      console.log("思考过程:", reasoningContent);

      // 检查内容是否为空字符串
      if (!content || content.trim() === "") {
        console.log("生成的内容为空，不添加消息");
      } else {
        // 只有在内容非空时，才保存包含内容和思考过程的完整消息
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content: content,
            reasoningContent: reasoningContent,
          },
        ]);
      }
    } catch (error) {
      console.error("生成对话失败:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 监听数据变化的useEffect
  useEffect(() => {
    // 创建一个包含Step1和Step2的组合数据对象
    const combinedData = { step1: Step1, step2: Step2 };
    const currentDataJSON = JSON.stringify(combinedData);

    // 如果数据没有变化，直接返回
    if (prevDataRef.current === currentDataJSON) return;

    // 更新之前的数据引用
    prevDataRef.current = currentDataJSON;

    // 如果没有足够的信息，直接返回
    if (!hasEnoughInfo()) return;

    // 清除任何现有的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器，延迟生成描述
    timerRef.current = setTimeout(() => {
      generateDescription();
      timerRef.current = null;
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [Step1, Step2]);

  // 添加一个新的useEffect，专门处理组件初始加载时的情况
  useEffect(() => {
    // 如果已经初始化过，则返回
    if (initializedRef.current) return;

    // 标记为已初始化
    initializedRef.current = true;

    // 检查是否有足够的信息可以生成描述
    if (hasEnoughInfo()) {
      console.log("组件初始化时检测到已有数据，开始生成描述");
      generateDescription();
    }
  }, []); // 依赖数组为空，表示只在组件挂载时执行一次

  return (
    <div className="px-4 space-y-4 text-md">
      {messages.length > 0 &&
        messages.map((message, index) => (
          <div key={index} className="space-y-2">
            {/* 显示思考过程 */}
            {message.reasoningContent && (
              <>
                <PreviewLoader text="Thought process:" isThinking={false} />
                <PreviewThinking texts={message.reasoningContent} />
              </>
            )}
            {/* 显示主要内容 */}
            <div className="bg-background rounded-md px-2 py-2">
              <Markdown>{message.content}</Markdown>
            </div>
          </div>
        ))}

      {/* 显示正在加载的内容 */}
      {loading && (
        <div className="space-y-2">
          {/* 显示正在加载的思考过程 */}
          {partialReasoning && (
            <>
              <PreviewLoader text="Thinking..." isThinking={loading} />
              <PreviewThinking texts={partialReasoning} />
            </>
          )}

          {partialOutput && (
            <div className="bg-background rounded-md px-4 py-2 relative">
              <Markdown>{partialOutput}</Markdown>
              <span className="animate-pulse inline-block ml-0.5">▌</span>
            </div>
          )}

          {!partialOutput && !partialReasoning && (
            <PreviewLoader text="Thinking..." isThinking={loading} />
          )}
        </div>
      )}

      {!loading && messages.length === 0 && <Skeleton className="w-full h-8" />}
    </div>
  );
}
