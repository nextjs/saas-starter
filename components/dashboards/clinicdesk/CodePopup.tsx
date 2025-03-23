import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AiCode } from '@/types/encounter';

interface CodePopupProps {
  code: AiCode | null;
  position: { x: number, y: number };
  onClose: () => void;
  onJumpToCode: () => void;
}

const CodePopup: React.FC<CodePopupProps> = ({ code, position, onClose, onJumpToCode }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to ensure popup stays within viewport
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if needed
      if (newX + rect.width > viewportWidth - 20) {
        newX = viewportWidth - rect.width - 20;
      }

      // Adjust vertical position if needed
      if (newY + rect.height > viewportHeight - 20) {
        newY = viewportHeight - rect.height - 20;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position, popupRef]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!code) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 shadow-lg animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        maxWidth: '350px'
      }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="font-medium text-lg">{code.code}</div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <img
                  src="/clinicdesk_logo.png"
                  width={16}
                  height={16}
                  alt="Close"
                  className="stroke-current"
                />
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              {code.description}
            </div>

            {code.audit && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-1">Evidence:</div>
                <div className="text-sm bg-muted/50 p-2 rounded-md">
                  {code.audit}
                </div>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={onJumpToCode}
              >
                Jump to Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodePopup;
