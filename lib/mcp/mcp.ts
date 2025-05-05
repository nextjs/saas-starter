export interface MCPContent {
    role: 'user' | 'assistant';
    type: 'text' | 'code' | 'image';
    content: string;
  }
  