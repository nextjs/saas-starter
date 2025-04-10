export async function handleSSEResponse(
  response: Response,
  onChunk: (text: string, reasoningText: string) => void
): Promise<{ content: string; reasoningContent: string }> {
  if (!response.body) {
    throw new Error("响应没有可读流");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let fullReasoningContent = "";

  try {
    // 初始化空字符串
    onChunk("", "");

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // 解码新的数据块
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 处理完整的行
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;

        if (line.startsWith("data: ")) {
          const data = line.substring(6);

          if (data === "[DONE]") {
            console.log("流传输完成");
            continue;
          }

          try {
            const jsonData = JSON.parse(data);
            
            // 处理常规内容 - 立即更新
            if (jsonData.content) {
              fullContent += jsonData.content;
              // 每收到一个块就立即更新UI
              onChunk(fullContent, fullReasoningContent);
            }
            
            // 处理推理内容 - 立即更新
            if (jsonData.reasoning_content) {
              fullReasoningContent += jsonData.reasoning_content;
              // 每收到一个块就立即更新UI
              onChunk(fullContent, fullReasoningContent);
            }
          } catch (e) {
            console.log("无法解析JSON:", data);
          }
        }
      }
    }

    return { content: fullContent, reasoningContent: fullReasoningContent };
  } catch (error) {
    console.error("读取流时出错:", error);
    throw error;
  }
}
