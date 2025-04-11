export async function handleSSEResponse(
  response: Response,
  onChunk: (text: string, reasoningText: string) => void,
  onNewMessage?: (message: string) => void
): Promise<{ content: string; reasoningContent: string }> {
  if (!response.body) {
    throw new Error("响应没有可读流");
  }

  const reader = response.body.getReader();
  let buffer = "";
  let fullContent = "";
  let fullReasoningContent = "";

  try {
    // 初始化空字符串
    onChunk("", "");

    // 创建一个TextDecoder对象来解码数据
    const decoder = new TextDecoder();
    
    // 处理事件行
    const processEventLine = (line: string) => {
      // 跳过空行
      if (!line.trim()) return;
      
      // 检查是否是SSE格式的数据行
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim(); // 移除"data:"前缀并修剪空白
        
        // 处理特殊的完成标记
        if (data === '[DONE]') {
          console.log('流传输完成');
          return;
        }
        
        try {
          // 解析JSON数据
          const jsonData = JSON.parse(data);
          
          // 1. 处理单个消息 - 如果提供了onNewMessage回调
          if (onNewMessage && jsonData.content !== undefined && jsonData.content !== null) {
            // 将每个消息作为独立的字符串传递，只有当内容不为null时
            onNewMessage(jsonData.content);
          }
          
          // 2. 同时维护累积的内容 - 用于兼容现有代码
          if (jsonData.content !== undefined && jsonData.content !== null) {
            fullContent += jsonData.content;
            // 只有在内容有变化时才触发回调
            onChunk(fullContent, fullReasoningContent);
          }
          
          if (jsonData.reasoning_content !== undefined && jsonData.reasoning_content !== null) {
            fullReasoningContent += jsonData.reasoning_content;
            // 只有在推理内容有变化时才触发回调
            onChunk(fullContent, fullReasoningContent);
          }
        } catch (e) {
          console.error('解析SSE数据失败:', e);
        }
      } else if (line.startsWith('event:')) {
        // 处理事件类型，如果API支持的话
        const eventType = line.slice(6).trim();
        console.log('事件类型:', eventType);
      } else if (line.startsWith('id:')) {
        // 处理事件ID，如果API支持的话
        const eventId = line.slice(3).trim();
        console.log('事件ID:', eventId);
      } else if (line.startsWith('retry:')) {
        // 处理重试时间，如果API支持的话
        const retryTime = parseInt(line.slice(6).trim(), 10);
        console.log('重试时间:', retryTime);
      }
    };

    // 使用stream reader处理响应流
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // 将新数据添加到缓冲区
      buffer += decoder.decode(value, { stream: true });
      
      // 处理完整的SSE行
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        processEventLine(line);
      }
    }
    
    // 处理最后一行（如果没有换行符结尾）
    if (buffer.trim()) {
      processEventLine(buffer);
    }

    return { content: fullContent, reasoningContent: fullReasoningContent };
  } catch (error) {
    console.error("读取流时出错:", error);
    throw error;
  }
}
