'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Bot, Copy, User, Send, Loader2, CheckCircle, Info } from 'lucide-react';
import { API_PREFIX, MCP_CONFIG_EXAMPLE } from "@/lib/constants";
import { toast } from "sonner";

/**
 * MCP内容类型
 * 定义MCP协议中的消息内容结构
 */
type MCPContent = {
  role: 'user' | 'assistant';
  type: 'text' | 'json' | 'binary';
  content: string;
};

/**
 * MCP Playground页面组件
 * 提供与MCP协议AI交互的界面
 */
export default function PlaygroundPage() {
  // 聊天相关状态
  const [input, setInput] = useState(""); // 用户输入内容
  const [messages, setMessages] = useState<MCPContent[]>([]); // 对话消息列表
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  // 配置相关状态
  const [apiKey, setApiKey] = useState(""); // API密钥
  const [temperature, setTemperature] = useState("0.7"); // 温度参数
  const [maxTokens, setMaxTokens] = useState("2048"); // 最大令牌数
  const [model, setModel] = useState("gpt-3.5-turbo"); // 模型选择
  const [streamMode, setStreamMode] = useState(true); // 流式响应模式
  const [copied, setCopied] = useState(false); // 复制状态

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null); // 消息列表末尾引用，用于自动滚动
  const inputRef = useRef<HTMLTextAreaElement>(null); // 输入框引用

  /**
   * 处理发送消息
   * 将用户输入发送到服务器并处理响应
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // 创建用户消息
    const userMessage: MCPContent = {
      role: 'user',
      type: 'text',
      content: input,
    };

    // 更新消息列表
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 准备请求参数
      const requestBody = {
        messages: [...messages, userMessage],
        model,
        temperature: parseFloat(temperature),
        max_tokens: parseInt(maxTokens, 10),
        stream: streamMode,
        api_key: apiKey,
      };

      // 发送请求
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // 处理流式响应
      if (streamMode) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        let assistantMessage = '';
        
        // 创建初始的助手消息
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', type: 'text', content: '' },
        ]);

        // 读取流式响应
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 解码并处理响应片段
          const chunk = new TextDecoder().decode(value);
          assistantMessage += chunk;

          // 更新最后一条消息
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              type: 'text',
              content: assistantMessage,
            };
            return newMessages;
          });
        }
      } else {
        // 处理非流式响应
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', type: 'text', content: data.content },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please check your API key and try again.');
      
      // 移除用户消息，恢复输入
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 复制MCP配置示例到剪贴板
   */
  const copyConfigExample = () => {
    navigator.clipboard.writeText(MCP_CONFIG_EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * 处理键盘事件
   * 支持Ctrl+Enter发送消息
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * 自动滚动到消息列表底部
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 聚焦输入框
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        {/* 聊天区域 */}
        <Card className="lg:col-span-2 flex flex-col h-full">
          <CardHeader>
            <CardTitle>MCP Playground</CardTitle>
            <CardDescription>Experience AI conversation with MCP protocol</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Start a new conversation! Enter your message and click send.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100"
                      } p-3 rounded-lg`}
                    >
                      <div className="mr-2 mt-0.5">
                        {msg.role === "user" ? (
                          <User size={18} />
                        ) : (
                          <Bot size={18} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          {msg.role === "user" ? "Client" : "MCP Server"} ({msg.type})
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
                    <Bot size={18} />
                    <div className="text-sm">Thinking...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="flex-1 resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="ml-2 bg-orange-500 hover:bg-orange-600 text-white h-[76px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Ctrl + Enter to send
            </p>
          </CardContent>
        </Card>

        {/* 配置区域 */}
        <Card className="h-full overflow-y-auto">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Adjust settings for the MCP protocol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="settings">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              {/* 设置选项卡 */}
              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`${API_PREFIX}_...`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your API key to use the MCP protocol
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperature: {temperature}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            Controls randomness: Lower values are more deterministic, higher values are more creative.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[parseFloat(temperature)]}
                    onValueChange={(value) => setTemperature(value[0].toString())}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    min="1"
                    max="4096"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="stream-mode"
                    checked={streamMode}
                    onCheckedChange={setStreamMode}
                  />
                  <Label htmlFor="stream-mode">Stream Mode</Label>
                </div>
              </TabsContent>
              
              {/* 信息选项卡 */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">About MCP Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    MCP (Model Control Protocol) is a standardized protocol for interacting with AI models. It provides a consistent interface for sending prompts and receiving responses.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Configuration Example</h3>
                  <div className="relative">
                    <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                      {MCP_CONFIG_EXAMPLE}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={copyConfigExample}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Usage</h3>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Enter your API key in the settings tab</li>
                    <li>Configure model parameters as needed</li>
                    <li>Type your message and click send</li>
                    <li>View the model's response in the chat area</li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
