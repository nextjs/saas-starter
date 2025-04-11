"use client";
import { chat } from "@/app/request/api";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { handleSSEResponse } from "@/app/utils/api";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PreviewThinking from "./preview-thinking";
import PreviewLoader from "./preview-loader";
import PreviewRepost from "./preview-repost";
import PreviewReply from "./preview-reply";
import Markdown from "react-markdown";
import PostReply from "./post-reply";

// 定义消息结构
interface Message {
  tweet: string;
  comments: string[];
  reasoningContent?: string;
}

export default function PreviewStepThree() {
  const Step1 = useAppSelector((state: any) => state.userReducer.from.step1);
  const Step2 = useAppSelector((state: any) => state.userReducer.from.step2);
  const Step3 = useAppSelector((state: any) => state.userReducer.from.step3);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [partialTweet, setPartialTweet] = useState<string>("");
  const [partialComments, setPartialComments] = useState<string[]>([]);
  const [displayedComments, setDisplayedComments] = useState<string[]>([]);
  const [showRepost, setShowRepost] = useState<boolean>(false); // 控制是否显示Repost组件
  const [partialReasoning, setPartialReasoning] = useState<string>("");
  const [isRevealingComments, setIsRevealingComments] = useState<boolean>(false);
  const commentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<any>(null);
  const initializedRef = useRef<boolean>(false);

  // 检查是否有足够的信息可以生成内容
  const hasEnoughInfo = () => {
    // 检查Step1, Step2, Step3是否存在且有值
    if (!Step1 || !Step2 || !Step3) return false;
    
    // 至少需要Step1中的名字和Step3中的互动数据
    return (
      Step1.name && Step1.name.trim() !== '' && 
      Step3.interactive && Step3.interactive.trim() !== ''
    );
  };

  const language = useAppSelector((state: any) => state.userReducer.config.language);

  // 构建提示信息，结合所有步骤的数据
  const buildPrompt = () => {
    let prompt = 'Please act as a Twitter content generator for a KOL. ';
    
    // 添加KOL基本信息 (Step1)
    prompt += `The KOL's name is ${Step1.name}`;
    if (Step1.gender) prompt += `, who is a ${Step1.gender}`;
    if (Step1.character) prompt += ` with a ${Step1.character} personality`;
    prompt += '. ';
    
    // 添加KOL能力和特征 (Step2)
    if (Step2.ability && Step2.ability.trim() !== '') {
      prompt += `This KOL has the following abilities and characteristics: ${Step2.ability}. `;
    }
    
    // 添加互动要求 (Step3)
    if (Step3.interactive && Step3.interactive.trim() !== '') {
      prompt += `The KOL should interact with users interested in: ${Step3.interactive}. `;
    }

    const languageName = language.find((item: any) => item.id === Step1.language)?.name;
    if (languageName) {
      prompt += `The KOL speaks ${languageName}. `;
    }
    
    // 明确生成内容的要求
    prompt += `Based on this information, please: 
    1. Generate ONE Twitter post (tweet) that showcases the KOL's personality and relates to their area of interest. Keep it under 280 characters.
    2. Then generate THIRTY different comment responses that this KOL might use to engage with followers. Each comment should be unique, reflect the KOL's personality, and be between 20-100 characters.
    
    Format your response with "TWEET:" followed by the tweet, then "COMMENTS:" followed by numbered comments (1-30).
    `;
    
    return prompt;
  };

  // 解析API返回的内容，分离推文和评论
  const parseContent = (content: string): { tweet: string; comments: string[] } => {
    let tweet = "";
    const comments: string[] = [];
    
    // 尝试提取推文
    const tweetMatch = content.match(/TWEET:(.+?)(?=COMMENTS:|$)/s);
    if (tweetMatch && tweetMatch[1]) {
      tweet = tweetMatch[1].trim();
    }
    
    // 尝试提取评论
    const commentsMatch = content.match(/COMMENTS:([\s\S]+)/);
    if (commentsMatch && commentsMatch[1]) {
      // 分割评论
      const commentLines = commentsMatch[1].split(/\d+\./).filter(line => line.trim());
      // 最多提取30条评论
      for (let i = 0; i < Math.min(commentLines.length, 30); i++) {
        comments.push(commentLines[i].trim());
      }
    }
    
    // 如果未找到格式化的内容，尝试进行基本拆分
    if (!tweet && !comments.length) {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        // 假设第一行是推文
        tweet = lines[0];
        // 其余行作为评论
        for (let i = 1; i < Math.min(lines.length, 31); i++) {
          comments.push(lines[i]);
        }
      }
    }
    
    return { tweet, comments };
  };

  // 渐进式显示评论
  const startRevealingComments = (comments: string[]) => {
    // 重置显示状态
    setDisplayedComments([]);
    setIsRevealingComments(true);
    
    // 清除任何现有的定时器
    if (commentIntervalRef.current) {
      clearInterval(commentIntervalRef.current);
    }
    
    // 首先显示推文
    setShowRepost(true);
    
    let commentIndex = 0;
    
    // 设置定时器，每隔1秒显示一条新评论
    commentIntervalRef.current = setInterval(() => {
      if (commentIndex < comments.length) {
        setDisplayedComments(prev => [...prev, comments[commentIndex]]);
        commentIndex++;
      } else {
        // 所有评论都已显示，清除定时器
        if (commentIntervalRef.current) {
          clearInterval(commentIntervalRef.current);
          commentIntervalRef.current = null;
        }
        setIsRevealingComments(false);
      }
    }, 1000);
  };

  // 在组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (commentIntervalRef.current) {
        clearInterval(commentIntervalRef.current);
      }
    };
  }, []);

  const generateContent = async () => {
    try {
      // 检查是否至少有一些内容可以生成
      if (!hasEnoughInfo()) {
        console.log('Not enough information to generate content');
        return;
      }
      
      // 重置状态 - 先清空当前显示的内容
      setMessage(null); // 清空当前的message，包含tweet
      setDisplayedComments([]); // 清空当前显示的评论
      
      // 然后设置其他状态
      setLoading(true);
      setPartialTweet("");
      setPartialComments([]);
      setPartialReasoning("");
      setShowRepost(false); // 隐藏Repost组件，直到生成完成
      setIsRevealingComments(false);
      
      // 清除任何现有的定时器
      if (commentIntervalRef.current) {
        clearInterval(commentIntervalRef.current);
        commentIntervalRef.current = null;
      }

      const prompt = buildPrompt();
      console.log('Generation prompt:', prompt);

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
          // 解析部分内容
          const { tweet, comments } = parseContent(text);
          setPartialTweet(tweet);
          setPartialComments(comments);
          setPartialReasoning(reasoningText);
        }
      );

      // 解析最终内容
      const { tweet, comments } = parseContent(content);
      
      console.log("Generated tweet:", tweet);
      console.log("Generated comments:", comments);
      console.log("Reasoning process:", reasoningContent);

      // 检查内容是否为空
      if ((!tweet || tweet.trim() === "") && (!comments || comments.length === 0)) {
        console.log("Generated content is empty, not adding message");
      } else {
        // 保存生成的内容
        setMessage({
          tweet,
          comments,
          reasoningContent
        });
        
        // 开始渐进式显示评论，在加载完成后
        startRevealingComments(comments);
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 监听数据变化的useEffect
  useEffect(() => {
    // 创建一个包含所有步骤的组合数据对象
    const combinedData = { step1: Step1, step2: Step2, step3: Step3 };
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
    
    // 设置新的定时器，延迟生成内容
    timerRef.current = setTimeout(() => {
      generateContent();
      timerRef.current = null;
    }, 500);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [Step1, Step2, Step3]);

  // 添加一个新的useEffect，专门处理组件初始加载时的情况
  useEffect(() => {
    // 如果已经初始化过，则返回
    if (initializedRef.current) return;
    
    // 标记为已初始化
    initializedRef.current = true;
    
    // 检查是否有足够的信息可以生成内容
    if (hasEnoughInfo()) {
      console.log('Detected existing data during component initialization, generating content');
      generateContent();
    }
  }, []); // 依赖数组为空，表示只在组件挂载时执行一次

  return (
    <div className="px-4 space-y-4 text-md">
      {/* 显示思考过程 */}
      {(loading || message?.reasoningContent) && (
        <>
          <PreviewLoader 
            text={loading ? "Thinking..." : "Thought process:"}
            isThinking={loading && !partialTweet && !partialComments.length} 
          />
          <PreviewThinking 
            texts={loading ? partialReasoning : (message?.reasoningContent || "")} 
          />
        </>
      )}
      
      {/* 显示推文 - 只在加载完成或显示标志为true时显示 */}
      {showRepost && message?.tweet ? (
        <>
          <PreviewLoader 
            text="Generated Tweet:" 
            isThinking={false} 
          />
          <PreviewRepost 
            content={message.tweet} 
            // 使用前两条评论作为repost和reply
            repost={message.comments && message.comments.length > 0 ? message.comments[0] : ""}
            reply={message.comments && message.comments.length > 1 ? message.comments[1] : ""}
          />
        </>
      ) : null}
      
      {/* 显示评论 */}
      {displayedComments.length > 0 && (
        <>
          <PreviewLoader 
            text={`Generated Comments (${displayedComments.length}${message ? '/' + message.comments.length : ''}):`}
            isThinking={isRevealingComments} 
          />
          <div className="space-y-2">
            {displayedComments.map((comment, index) => (
              <PostReply key={index} content={comment} />
            ))}
            
            {/* 显示加载下一条评论的指示器 */}
            {isRevealingComments && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-pulse h-2 w-16 bg-primary/20 rounded-full"></div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* 加载状态或空状态 */}
      {!loading && !message && !isRevealingComments && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p>Waiting for data from previous steps</p>
          <p className="text-sm">Please complete Steps 1-3 to generate content</p>
        </div>
      )}
    </div>
  );
}
