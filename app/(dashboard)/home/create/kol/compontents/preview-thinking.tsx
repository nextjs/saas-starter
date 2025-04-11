"use client";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
interface PreviewThinkingProps {
  texts: string[] | string;
  isLoading?: boolean; // 是否正在加载/生成中
  currentText?: string; // 当前正在生成的文本
}

export default function PreviewThinking(props: PreviewThinkingProps) {
  const { texts, isLoading = false, currentText = "" } = props;

  return (
    <div className="space-y-4 border-l-2 border-secondary pl-2 text-md">
      {/* 显示已完成的思考内容 */}
      {Array.isArray(texts)
        ? texts.map((text, index) => <Markdown key={index}>{text}</Markdown>)
        : typeof texts === "string" && texts && <Markdown>{texts}</Markdown>}

      {/* 显示当前正在生成的内容，带有闪烁的光标 */}
      {isLoading && currentText && (
        <div className="relative">
          <Markdown>{currentText}</Markdown>
          <span className="animate-pulse inline-block ml-0.5">▌</span>
        </div>
      )}
    </div>
  );
}
