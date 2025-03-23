"use client";

import React, { useState, useEffect } from 'react';
import { AiCode } from '@/types/encounter';
import CodePopup from './CodePopup';

interface FormattedEncounterProps {
  encounterText: string;
  codes: AiCode[];
  onCodeClick?: (codeId: string) => void;
  scrollToMedicalCodes?: () => void;
}

const FormattedEncounter: React.FC<FormattedEncounterProps> = ({ 
  encounterText, 
  codes, 
  onCodeClick,
  scrollToMedicalCodes
}) => {
  const [popupInfo, setPopupInfo] = useState<{
    code: AiCode | null;
    position: { x: number; y: number };
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to highlight codes in the encounter text
  const highlightCodes = (text: string) => {
    if (!codes || codes.length === 0) {
      return <pre className="font-sans whitespace-pre-wrap break-words">{text}</pre>;
    }

    let result = text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Process each code and highlight its evidence in the text
    codes.forEach((code) => {
      const evidence = code.audit;
      if (evidence && evidence !== 'No evidence available') {
        const index = result.indexOf(evidence, lastIndex);
        if (index !== -1) {
          // Add text before the match
          elements.push(<span key={`text-${lastIndex}`}>{result.substring(lastIndex, index)}</span>);
          
          // Add the highlighted match with click handler
          elements.push(
            <span 
              key={`highlight-${index}`} 
              className="bg-red-100 text-red-800 px-1 py-0.5 rounded cursor-pointer hover:bg-red-200 transition-colors" 
              title={`${code.code}: ${code.description || ''} - Click to view details`}
              onClick={(e) => handleCodeClick(e, code)}
            >
              {evidence}
            </span>
          );
          
          lastIndex = index + evidence.length;
        }
      }
    });

    // Add remaining text
    if (lastIndex < result.length) {
      elements.push(<span key={`text-end`}>{result.substring(lastIndex)}</span>);
    }

    return <pre className="font-sans whitespace-pre-wrap break-words">{elements.length > 0 ? elements : result}</pre>;
  };

  // Handle code click to show popup and optionally notify parent
  const handleCodeClick = (e: React.MouseEvent, code: AiCode) => {
    setPopupInfo({
      code,
      position: { x: e.clientX, y: e.clientY }
    });
    
    // Optionally notify parent component
    if (onCodeClick) {
      onCodeClick(code.code);
    }
  };

  // Close the popup
  const handleClosePopup = () => {
    setPopupInfo(null);
  };

  // Jump to code section and close popup
  const handleJumpToCode = () => {
    if (popupInfo && popupInfo.code && onCodeClick) {
      onCodeClick(popupInfo.code.code);
    }
    
    // Scroll to medical codes section if the function is provided
    if (scrollToMedicalCodes) {
      scrollToMedicalCodes();
    }
    
    setPopupInfo(null);
  };

  return (
    <div className="overflow-x-auto">
      {isMounted 
        ? highlightCodes(encounterText) 
        : <pre className="font-sans whitespace-pre-wrap break-words">{encounterText}</pre>
      }
      
      {isMounted && popupInfo && (
        <CodePopup
          code={popupInfo.code}
          position={popupInfo.position}
          onClose={handleClosePopup}
          onJumpToCode={handleJumpToCode}
        />
      )}
    </div>
  );
};

export default FormattedEncounter;
