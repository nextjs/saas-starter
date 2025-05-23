'use client';

import { useState } from 'react';

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function CollapsibleText({ text, maxLength = 150, className = '' }: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }
  
  const displayText = isExpanded ? text : `${text.slice(0, maxLength)}...`;
  
  return (
    <div className={className}>
      <p className="inline">{displayText}</p>
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          More
        </button>
      )}
      {isExpanded && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          Less
        </button>
      )}
    </div>
  );
} 