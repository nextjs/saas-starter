import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface AnimatedProgressBarProps {
  progress: number;
  height?: string;
  bgColor?: string;
  onComplete?: () => void;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ 
  progress = 0, 
  height = 'h-4', 
  bgColor = 'bg-gray-200',
  onComplete
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Interpolate color from blue-500 to green-500
  const interpolateColor = (p: number) => {
    const start = { r: 59, g: 130, b: 246 };
    const end = { r: 34, g: 197, b: 94 };
    const r = Math.round(start.r + (end.r - start.r) * (p / 100));
    const g = Math.round(start.g + (end.g - start.g) * (p / 100));
    const b = Math.round(start.b + (end.b - start.b) * (p / 100));
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev >= progress) {
          clearInterval(timer);
          if (prev === 100) {
            setTimeout(() => {
              setIsComplete(true);
              // Call onComplete callback after the progress bar has filled
              if (onComplete) setTimeout(onComplete, 500);
            }, 500);
          }
          return progress;
        }
        return prev + 1 // Slower increment (0.5 instead of 1)
      });
    }, 40); // Slower interval (40ms instead of 20ms)
    return () => clearInterval(timer);
  }, [progress, onComplete]);

  return (
    <div className="relative flex items-center space-x-3">
      <div className="flex-grow">
        <div className={`${"w-full " + height} ${bgColor} rounded-full overflow-hidden`}>
          <div
            className={`${height} rounded-full transition-all duration-300 ease-out relative`}
            style={{
              width: `${displayProgress}%`,
              backgroundColor: interpolateColor(displayProgress),
              transform: `translateX(${displayProgress === 100 ? '0' : '-' + (100 - displayProgress) + '%'})`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-base font-semibold text-gray-700 w-10 text-right">{displayProgress}%</span>
        {isComplete && (
          <Check className="text-green-500 animate-ping" size={20} strokeWidth={3} />
        )}
      </div>
    </div>
  );
};

export const ProgressBarsStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [activeBar, setActiveBar] = useState(0);
  const descriptions = [
    "Defining Your Personal Objectives",
    "Identifying Potential Development Paths",
    "Curating Tailored Learning Resources", 
    "Designing Personalized Growth Challenges"
  ];

  // Function to handle progress bar completion and trigger the next one
  const handleProgressComplete = (index: number) => {
    if (index < descriptions.length - 1) {
      // Start the next bar with a longer delay
      setTimeout(() => setActiveBar(index + 1), 1000); // 1 second delay between bars
    } else {
      // If the last bar is complete, wait a moment and then trigger onNext
      setTimeout(onNext, 2000); // 2 second delay before proceeding
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-center">
        Tailoring Your Transformative Experience...
      </h2>
      {descriptions.map((description, idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="text-md font-semibold text-gray-800">{description}</h3>
          {idx <= activeBar && (
            <AnimatedProgressBar 
              progress={100} 
              onComplete={idx === activeBar ? () => handleProgressComplete(idx) : undefined}
            />
          )}          
        </div>
      ))}
    </div>
  );
}; 