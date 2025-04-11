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

export default function PreviewStepOne() {
  const Step1 = useAppSelector((state: any) => state.userReducer.from.step1);
  const region = useAppSelector(
    (state: any) => state.userReducer.config.region
  );
  const language = useAppSelector(
    (state: any) => state.userReducer.config.language
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [partialOutput, setPartialOutput] = useState<string>("");
  const [partialReasoning, setPartialReasoning] = useState<string>("");
  const dispatch = useAppDispatch();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStep1Ref = useRef<any>(null);
  const initializedRef = useRef<boolean>(false);

  // 检查Step1是否所有必要字段都已填写
  const isStep1Complete = () => {
    // 检查Step1是否存在
    if (!Step1) return false;

    // 定义必要字段列表
    const requiredFields = [
      "name",
      "gender",
      "character",
      "region",
      "language",
    ];

    // 检查每个必要字段是否存在且不为空
    return requiredFields.every(
      (field) =>
        Step1[field] !== undefined &&
        Step1[field] !== null &&
        Step1[field] !== "" &&
        Step1[field] !== 0
    );
  };

  // 检查除了性别外的所有字段是否为空
  const isAllEmpty = () => {
    // 如果Step1不存在，返回true（认为是空的）
    if (!Step1) return true;
    
    // 要检查的字段，排除性别(gender)
    const fieldsToCheck = ['name', 'character', 'region', 'language'];
    
    // 检查每个字段是否都是空的
    // 只要有一个字段有值，就返回false（不是都空）
    return fieldsToCheck.every(field => 
      Step1[field] === undefined || 
      Step1[field] === null || 
      Step1[field] === ''
    );
  };

  // 构建提示信息，只包含已填写的字段
  const buildPrompt = () => {
    let prompt = '';
    
    // 添加名称
    if (Step1.name && Step1.name.trim() !== '') {
      prompt += `Hi, my name is ${Step1.name}. `;
    }
    
    // 添加性别
    if (Step1.gender) {
      prompt += `I am a ${Step1.gender}. `;
    }
    
    // 添加地区
    const regionName = region.find(
      (item: any) => item.id === Step1.region
    )?.name;
    if (regionName) {
      prompt += `I am from ${regionName}. `;
    }
    
    // 添加性格/角色
    if (Step1.character && Step1.character.trim() !== '') {
      prompt += `I am a ${Step1.character}. `;
    }
    
    // 添加语言
    const languageName = language.find(
      (item: any) => item.id === Step1.language
    )?.name;
    if (languageName) {
      prompt += `I speak ${languageName}. `;
    }
    
    // 只有当所有必要字段都填写完时，添加语言生成请求
    if (isStep1Complete()) {
      prompt += `Please introduce myself in ${languageName || 'English'}.`;
    } else {
      prompt += `Please introduce myself in ${languageName || 'English'}.`;
    }
    
    return prompt;
  };

  // 检查Step1是否有足够的信息可以生成描述
  const hasEnoughInfo = () => {
    // 如果是全空的，返回false
    if (isAllEmpty()) return false;
    
    // 至少需要名字或性格特征之一
    return (
      (Step1.name && Step1.name.trim() !== '') || 
      (Step1.character && Step1.character.trim() !== '')
    );
  };

  const generateDescription = async () => {
    try {
      // 检查是否至少有一些内容可以生成
      if (!hasEnoughInfo()) {
        console.log('没有足够的信息可以生成描述');
        return;
      }
      
      setLoading(true);
      setPartialOutput("");
      setPartialReasoning("");

      const prompt = buildPrompt();
      console.log('生成提示:', prompt);

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

      // 保存包含内容和思考过程的完整消息
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: content,
          reasoningContent: reasoningContent,
        },
      ]);
    } catch (error) {
      console.error("生成对话失败:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 处理Step1变化的useEffect
  useEffect(() => {
    if (!Step1) return;

    const currentStepJSON = JSON.stringify(Step1);
    if (prevStep1Ref.current === currentStepJSON) return;

    prevStep1Ref.current = currentStepJSON;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      generateDescription();
      timerRef.current = null;
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [Step1, region, language]);

  // 添加一个新的useEffect，专门处理组件初始加载时的情况
  useEffect(() => {
    // 如果已经初始化过，或者没有Step1数据，则返回
    if (initializedRef.current || !Step1) return;
    
    // 标记为已初始化
    initializedRef.current = true;
    
    // 检查是否有足够的信息可以生成描述
    if (hasEnoughInfo()) {
      console.log('组件初始化时检测到已有数据，开始生成描述');
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
                <PreviewLoader
                  text={loading ? "Thinking..." : "Thought process:"}
                  isThinking={loading}
                />
                <PreviewThinking texts={message.reasoningContent} />
              </>
            )}
            {/* 显示主要内容 */}
            <p className="bg-background rounded-md px-2 py-2">
              <Markdown>{message.content}</Markdown>
            </p>
          </div>
        ))}

      {/* 显示正在加载的内容 */}
      {loading && (
        <div className="space-y-2">
          {partialOutput && (
            <div className="bg-background/80 rounded-md px-2 py-2 relative">
              {partialOutput}
              <span className="animate-pulse inline-block ml-0.5">▌</span>
            </div>
          )}

          {/* 显示正在加载的思考过程 */}
          {partialReasoning && (
            <>
              <PreviewLoader text="Thinking..." isThinking={loading} />
              <PreviewThinking texts={partialReasoning} />
            </>
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
