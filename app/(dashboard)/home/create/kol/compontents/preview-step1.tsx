"use client";
import { chat } from "@/app/request/api";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { handleSSEResponse } from "@/app/utils/api";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { clearFrom } from "@/app/store/reducers/userSlice";

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

  const generateDescription = async () => {
    try {
      if (!isStep1Complete()) {
        return;
      }
      setLoading(true);
      setPartialOutput("");
      setPartialReasoning("");

      const data = {
        ...Step1,
        region:
          region.find((item: any) => item.id === Step1.region)?.name || "",
        language:
          language.find((item: any) => item.id === Step1.language)?.name ||
          "English",
      };

      const response: any = await chat({
        messages: [
          {
            content: `According to kol's following message ${JSON.stringify(
              data
            )}, generate a readme, reply in the language chosen in the language field, if not, the default is English, no need to output anything else.`,
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

  useEffect(() => {
    if (!Step1 || !Step1.name) return;

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

  return (
    <div className="px-4 space-y-4 text-md">
      {messages.length > 0 &&
        messages.map((message, index) => (
          <div key={index} className="space-y-2">
            {/* 显示思考过程 */}
            {message.reasoningContent && (
              <div className="bg-background/50 rounded-md px-2 py-2 text-sm text-muted-foreground">
                <p className="font-medium text-xs mb-1">Thinking...</p>
                <p className="whitespace-pre-line">
                  {message.reasoningContent}
                </p>
              </div>
            )}
            {/* 显示主要内容 */}
            <p className="bg-background rounded-md px-2 py-2">
              {message.content}
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
            <div className="bg-background/50 rounded-md px-2 py-2 text-sm text-muted-foreground relative">
              <p className="font-medium text-xs mb-1">Thinking...</p>
              <p className="whitespace-pre-line">
                {partialReasoning}
                <span className="animate-pulse inline-block ml-0.5">▌</span>
              </p>
            </div>
          )}

          {!partialOutput && !partialReasoning && (
            <div className="bg-background/80 rounded-md px-2 py-2 flex items-center">
              <span className="">Thinking...</span>
            </div>
          )}
        </div>
      )}

      {!loading && messages.length === 0 && <Skeleton className="w-full h-8" />}
    </div>
  );
}
