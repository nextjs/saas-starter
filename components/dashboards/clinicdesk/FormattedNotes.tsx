import React, { useState } from 'react';
import { CodeEvidence } from '@/types/encounter';
import CodePopup from './CodePopup';

interface FormattedNotesProps {
  notes: string;
  codes: CodeEvidence[];
  onCodeClick?: (codeId: string) => void;
  aiCodes?: any[]; // Array of full AI code objects for popup display
  scrollToMedicalCodes?: () => void;
}

const FormattedNotes: React.FC<FormattedNotesProps> = ({ 
  notes, 
  codes, 
  onCodeClick, 
  aiCodes = [],
  scrollToMedicalCodes
}) => {
  const [popupInfo, setPopupInfo] = useState<{
    code: any | null;
    position: { x: number; y: number };
  } | null>(null);

  // Function to highlight evidence in the notes
  const highlightEvidence = (text: string) => {
    if (!codes || codes.length === 0) {
      return <div>{text}</div>;
    }

    let result = text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Simple highlighting approach - could be enhanced with more sophisticated matching
    codes.forEach((code) => {
      const evidence = code.evidence;
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
              title={`${code.context || code.id} - Click to view details`}
              onClick={(e) => handleCodeClick(e, code.id)}
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

    return <div>{elements.length > 0 ? elements : result}</div>;
  };

  // Handle code click to show popup and optionally notify parent
  const handleCodeClick = (e: React.MouseEvent, codeId: string) => {
    // Find the full code object for the popup
    const codeObject = aiCodes.find(code => code.code === codeId);
    
    if (codeObject) {
      setPopupInfo({
        code: codeObject,
        position: { x: e.clientX, y: e.clientY }
      });
    }
    
    // Optionally notify parent component
    if (onCodeClick) {
      onCodeClick(codeId);
    }
  };

  // Close the popup
  const handleClosePopup = () => {
    setPopupInfo(null);
  };

  // Jump to code section and close popup
  const handleJumpToCode = () => {
    if (popupInfo && onCodeClick) {
      onCodeClick(popupInfo.code.code);
    }
    
    // Scroll to medical codes section if the function is provided
    if (scrollToMedicalCodes) {
      scrollToMedicalCodes();
    }
    
    setPopupInfo(null);
  };

  return (
    <div className="p-3 bg-muted/50 rounded-md">
      {highlightEvidence(notes)}
      
      {popupInfo && (
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

export default FormattedNotes;
