"use client";

import { useState, useEffect } from "react";
import type { MCPContent } from "@/lib/mcp/mcp";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SendIcon,
  User,
  Bot,
  Key,
  Sliders,
  Copy,
  CheckCircle,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { API_PREFIX, MCP_CONFIG_EXAMPLE } from "@/lib/constants";
import { toast } from "sonner";

export default function PlaygroundPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MCPContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 配置相关状态
  const [apiKey, setApiKey] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("2048");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [streamMode, setStreamMode] = useState(true);
  const [copied, setCopied] = useState(false);

  // API Key验证状态
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [keyPermissions, setKeyPermissions] = useState<string | null>(null);

  // 当API Key变化时，重置验证状态
  useEffect(() => {
    if (apiKey) {
      setIsKeyValid(null);
    }
  }, [apiKey]);

  // 验证API Key
  const validateApiKey = async () => {
    if (!apiKey) {
      toast.error("请输入API Key");
      return;
    }

    // 检查API Key格式
    if (!apiKey.startsWith(`${API_PREFIX}_`)) {
      setIsKeyValid(false);
      toast.error(`API Key格式错误，应以 ${API_PREFIX}_ 开头`);
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/api-keys/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setIsKeyValid(true);
        // 如果API返回了权限信息，可以保存起来
        if (data.permissions) {
          setKeyPermissions(data.permissions);
        }
        toast.success("API Key验证成功");
      } else {
        setIsKeyValid(false);
        toast.error(data.error || "API Key无效或已过期");
      }
    } catch (error) {
      console.error("验证失败:", error);
      setIsKeyValid(false);
      toast.error("API Key验证失败");
    } finally {
      setIsValidating(false);
    }
  };

  // 检查MCP Server状态
  const checkMCPServerStatus = async () => {
    if (!apiKey) {
      toast.error("请输入API Key");
      return;
    }

    if (isKeyValid !== true) {
      toast.error("请先验证API Key");
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/mcp/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.status === "online") {
        toast.success("MCP Server 状态正常");
      } else {
        toast.error(data.error || "MCP Server 连接失败");
      }
    } catch (error) {
      console.error("检查MCP Server状态失败:", error);
      toast.error("MCP Server 连接失败");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // 如果设置了API Key但未验证或验证失败，则先验证
    if (apiKey && isKeyValid !== true) {
      toast.error("请先验证API Key");
      return;
    }

    // 添加用户消息到对话
    const userMessage: MCPContent = {
      role: "user",
      type: "text",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          prompt: input,
          temperature: parseFloat(temperature),
          max_tokens: parseInt(maxTokens),
          model: model,
          stream: streamMode,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("请求失败:", error);
      toast.error("请求失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        {/* 聊天区域 */}
        <Card className="lg:col-span-2 flex flex-col h-full">
          <CardHeader>
            <CardTitle>MCP Playground</CardTitle>
            <CardDescription>体验基于MCP协议的AI对话</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>开始一个新对话吧！输入内容并点击发送按钮。</p>
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
                    <div className="text-sm">正在思考...</div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的问题..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()} // TODO：添加API Key验证
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 配置区域 */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>配置选项</CardTitle>
            <CardDescription>调整API参数和设置</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue="api" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="api" className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  API设置
                </TabsTrigger>
                <TabsTrigger value="params" className="flex items-center">
                  <Sliders className="mr-2 h-4 w-4" />
                  参数调整
                </TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`${API_PREFIX}_...`}
                        className={`pr-10 ${
                          isKeyValid === true
                            ? "border-green-500"
                            : isKeyValid === false
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {isKeyValid !== null && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isKeyValid ? (
                            <Shield className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={validateApiKey}
                      disabled={isValidating || !apiKey}
                    >
                      {isValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "验证"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    输入您的API密钥以使用自定义模型
                  </p>
                  {isKeyValid === false && (
                    <p className="text-xs text-red-500">
                      API Key无效或已过期，请检查后重试
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* MCP脚本配置 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mcpScript">MCP Config</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => copyToClipboard(MCP_CONFIG_EXAMPLE)}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-1">{copied ? "已复制" : "复制"}</span>
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto font-mono h-40">
                      {MCP_CONFIG_EXAMPLE}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MCP配置用于自定义AI助手的行为和能力
                  </p>
                </div>

                {/* MCP Server状态检查按钮 */}
                <div className="pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={checkMCPServerStatus}
                    disabled={isValidating || !apiKey || isKeyValid !== true}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {isValidating ? "正在检查MCP Server..." : "检查MCP Server状态"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="params" className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">模型选择</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">
                        Claude 3 Opus
                      </SelectItem>
                      <SelectItem value="claude-3-sonnet">
                        Claude 3 Sonnet
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="streamMode"
                    checked={streamMode}
                    onCheckedChange={setStreamMode}
                  />
                  <Label htmlFor="streamMode">流式响应</Label>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">温度: {temperature}</Label>
                    <span className="text-xs text-muted-foreground">
                      {temperature}
                    </span>
                  </div>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    较低的值使输出更确定，较高的值使输出更随机
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">最大令牌数</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    min="1"
                    max="8192"
                  />
                  <p className="text-xs text-muted-foreground">
                    限制响应的最大长度
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>高级选项</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="topP" className="text-xs">
                        Top P
                      </Label>
                      <Input id="topP" placeholder="1.0" />
                    </div>
                    <div>
                      <Label htmlFor="freqPenalty" className="text-xs">
                        频率惩罚
                      </Label>
                      <Input id="freqPenalty" placeholder="0.0" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
