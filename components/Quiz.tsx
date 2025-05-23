// This component renders a step-by-step quiz; supports single_choice question types
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { ProgressBarsStep } from '@/components/ProgressBars';
import { cn } from '@/lib/utils';
import { motion } from 'framer-text';

interface Option {
  label: string;
  value: string;
  // URL for the option image
  imageUrl?: string;
  // CSS class for Flaticon icon as fallback
  iconClass?: string;
  // URL for PNG icon
  iconPNG?: string;
}

interface Question {
  id: number;
  type: 'single_choice' | 'multi_choice' | 'info' | 'summary' | 'form_input' | string;
  question?: string;
  options?: Option[];
  // index strings for multi-choice correct answers
  correctIndexes?: string[];
  title?: string;
  subtitle?: string;
  message?: string;
  goal_prc?: string;
  button_label?: string;
  note?: string;
  // CSS class for icons
  iconClass?: string;
  // color for info-step icon (CSS color string)
  color?: string;
  fields?: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[];
  hint?: string;
  if_wrong?: string;
  explanation?: string;
}

interface QuizProps {
  title?: string;
  subtitle?: string;
  questions: Question[];
  footerHtml?: string;
  initialData?: Record<string, any>;
  cardClassName?: string;
  onSubmit?: (data: Record<string, any>) => void;
  onComplete?: (data: Record<string, any>) => void;
}

export default function Quiz({
  title,
  subtitle,
  questions,
  footerHtml,
  initialData = {},
  cardClassName,
  onSubmit,
  onComplete,
}: QuizProps) {
  // Current step index
  const [stepIndex, setStepIndex] = useState(0);

  // All answers given so far
  const [answers, setAnswers] = useState<Record<string, any>>(initialData);

  // Whether to show the hint for the current question
  const [showHint, setShowHint] = useState(false);
  
  // Whether the answer has been checked for multi-choice questions
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Reset the hint visibility when changing questions
  useEffect(() => {
    setShowHint(false);
    setIsAnswerChecked(false);
  }, [stepIndex]);

  // The current question
  const current = questions[stepIndex];

  // Save data when needed
  useEffect(() => {
    if (Object.keys(answers).length > 0 && onSubmit) {
      onSubmit(answers);
    }
  }, [answers, onSubmit]);

  // Finishing
  const handleFinish = useCallback(() => {
    if (onComplete) {
      onComplete(answers);
    }
  }, [answers, onComplete]);

  // Animation settings for the fade-in/out transition
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const [youP] = useState(() => Math.floor(Math.random() * (29 - 21 + 1)) + 21);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Define special step indices after summary
  const progressBarsStep = questions.length;
  const formInputStep = questions.length + 1;
  const finalConfettiStep = questions.length + 2;
  const isFinalStep = stepIndex === finalConfettiStep;

  useEffect(() => {
    setQuizSessionId(`quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Function to save quiz data to database via API
  const saveQuizData = async () => {
    try {
      console.log('Saving quiz data...', { stepIndex, quizSessionId, answers });
      
      // Zbierz dane analityczne które można wykorzystać
      const analytics = {
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        utm_source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') : '',
        utm_medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') : '',
        utm_campaign: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_campaign') : '',
        browser: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        device: typeof navigator !== 'undefined' ? navigator.platform : '',
      };

      const dataToSend = {
        sessionId: quizSessionId,
        answers,
        formData,
        completedAt: isFinalStep ? new Date().toISOString() : null,
        currentStep: stepIndex,
        score: youP,
        startTime: localStorage.getItem('quizStartTime') || new Date().toISOString(),
        currentTime: new Date().toISOString(),
        analytics
      };
      
      console.log('Sending data to API:', JSON.stringify(dataToSend));

      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save quiz data. Status:', response.status, 'Error:', errorText);
        return false;
      }
      
      const data = await response.json();
      console.log('Quiz data saved successfully:', data);
      
      return true;
    } catch (error) {
      console.error('Error saving quiz data:', error);
      return false;
    }
  };

  // Zapisuj czas rozpoczęcia quizu
  useEffect(() => {
    if (stepIndex === 0 && !localStorage.getItem('quizStartTime')) {
      localStorage.setItem('quizStartTime', new Date().toISOString());
      console.log('Quiz start time set:', localStorage.getItem('quizStartTime'));
    }
  }, [stepIndex]);

  // Save data whenever answers change
  useEffect(() => {
    if (stepIndex >= 0 && quizSessionId) {
      console.log(`Step changed to ${stepIndex}, triggering data save...`);
      saveQuizData();
    }
  }, [stepIndex, answers, formData]);

  // Trigger confetti when reaching the final step
  useEffect(() => {
    if (isFinalStep) {
      // Fire multiple confetti bursts from bottom of the screen
      const duration = 5000;
      const end = Date.now() + duration;
      
      // Create a specific canvas for confetti
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '9999';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);
      
      const myConfetti = confetti.create(canvas, { resize: true });
      
      const shootConfetti = () => {
        myConfetti({
          particleCount: 200,
          spread: 120,
          origin: { x: 0.1, y: 0.9 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
          disableForReducedMotion: false
        });
        
        myConfetti({
          particleCount: 200,
          spread: 120,
          origin: { x: 0.9, y: 0.9 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
          disableForReducedMotion: false
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(shootConfetti);
        } else {
          // Clean up when done
          setTimeout(() => {
            document.body.removeChild(canvas);
          }, 2000);
        }
      };
      
      shootConfetti();
    }
  }, [isFinalStep]);

  const handleBegin = () => {
    setStepIndex(0);
  };

  // Function to restart chart animation
  const restartAnimation = () => {
    if (!chartContainerRef.current) return;
    
    // Remove all animations
    const elements = chartContainerRef.current.querySelectorAll('.bar, .skill-badge, .grid-line, .percent-label, .x-label');
    
    elements.forEach(el => {
      // Reset animation
      (el as HTMLElement).style.animation = 'none';
      el.getBoundingClientRect(); // Trigger reflow
    });
    
    // Reset container animation
    chartContainerRef.current.style.animation = 'none';
    chartContainerRef.current.getBoundingClientRect();
    chartContainerRef.current.style.animation = 'fadeUp 0.8s forwards';
    
    // Re-apply grid lines animations
    chartContainerRef.current.querySelectorAll('.grid-line').forEach((line, index) => {
      (line as HTMLElement).style.animation = `growLine 1.2s forwards ${0.2 * (index + 1)}s`;
    });
    
    // Re-apply bar animations
    const bar1 = chartContainerRef.current.querySelector('.bar-1') as HTMLElement;
    const bar2 = chartContainerRef.current.querySelector('.bar-2') as HTMLElement;
    const bar3 = chartContainerRef.current.querySelector('.bar-3') as HTMLElement;
    const bar4 = chartContainerRef.current.querySelector('.bar-4') as HTMLElement;
    const bar5 = chartContainerRef.current.querySelector('.bar-5') as HTMLElement;
    
    if (bar1) bar1.style.animation = 'fadeIn 0.5s forwards 0.2s, growUp 1s forwards 0.7s';
    if (bar2) bar2.style.animation = 'fadeIn 0.5s forwards 0.4s, growUp 1s forwards 0.9s';
    if (bar3) bar3.style.animation = 'fadeIn 0.5s forwards 0.6s, growUp 1s forwards 1.1s';
    if (bar4) bar4.style.animation = 'fadeIn 0.5s forwards 0.8s, growUp 1s forwards 1.3s';
    if (bar5) bar5.style.animation = 'fadeIn 0.5s forwards 1.0s, growUp 1s forwards 1.5s';
    
    // Re-apply badges animations
    const badge1 = chartContainerRef.current.querySelector('.badge-1') as HTMLElement;
    const badge3 = chartContainerRef.current.querySelector('.badge-3') as HTMLElement;
    const badge4 = chartContainerRef.current.querySelector('.badge-4') as HTMLElement;
    
    if (badge1) badge1.style.animation = 'fadeDown 0.5s forwards 1.0s';
    if (badge3) badge3.style.animation = 'fadeDown 0.5s forwards 1.2s';
    if (badge4) badge4.style.animation = 'fadeDown 0.5s forwards 1.4s';
    
    // Re-apply x-labels animation
    chartContainerRef.current.querySelectorAll('.x-label').forEach(label => {
      (label as HTMLElement).style.animation = 'fadeIn 0.5s forwards 1.5s';
    });
  };

  const handleSelect = (value: string) => {
    if (!current) return;
    
    if (current.type === 'multi_choice') {
      // For multi-choice, we need to toggle the selection
      setAnswers(prev => {
        const currentAnswers = prev[current.id] as string[] || [];
        const valueIndex = currentAnswers.indexOf(value);
        
        if (valueIndex === -1) {
          // Add the value if not selected
          return { ...prev, [current.id]: [...currentAnswers, value] };
        } else {
          // Remove the value if already selected
          return { 
            ...prev, 
            [current.id]: currentAnswers.filter(v => v !== value)
          };
        }
      });
      
      // Don't advance automatically for multi-choice
      return;
    }
    
    // For single choice, record answer
    setAnswers(prev => ({ ...prev, [current.id]: value }));

    // If a correctIndex is defined, immediately show feedback
    if (current.correctIndex !== undefined) {
      setIsAnswerChecked(true);
      return;
    }

    // Otherwise, auto-advance after a short delay
    setTimeout(() => {
      const next = stepIndex + 1;
      if (next < questions.length) {
        setStepIndex(next);
      } else {
        console.log('Quiz complete:', answers);
      }
    }, 500);
  };
  
  const handleMultiChoiceNext = () => {
    // Skip check and go straight to next if no correctIndexes defined
    const correctIdxs = current.correctIndexes || [];
    if (correctIdxs.length === 0) {
      const next = stepIndex + 1;
      if (next < questions.length) {
        setStepIndex(next);
      } else {
        console.log('Quiz complete:', answers);
      }
      return;
    }
    console.log('handleMultiChoiceNext called', { stepIndex, answers, isAnswerChecked });
    if (!isAnswerChecked) {
      // First click: check answers and show feedback
      setIsAnswerChecked(true);
    } else {
      // Second click: proceed to next question
      const next = stepIndex + 1;
      if (next < questions.length) {
        setStepIndex(next);
      } else {
        console.log('Quiz complete:', answers);
      }
    }
  };
  
  // Helper to check if an option is selected in multi-choice
  const isOptionSelected = (value: string): boolean => {
    if (!current) return false;
    
    const currentAnswers = answers[current.id];
    if (Array.isArray(currentAnswers)) {
      return currentAnswers.includes(value);
    }
    
    return false;
  };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  let content = null;
  if (stepIndex < 0) {
    content = (
      // Begin screen
      <>
        <h1 className="text-4xl font-bold mb-6 text-center">Quiz</h1>
        <p className="text-gray-700 mb-4 text-center">
          Before we proceed to the Focus your AI further, let me ask you a few questions to develop a learning plan specially for you.
        </p>
        <Button
          onClick={handleBegin}
          className="block mx-auto w-1/2 h-12 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-base flex items-center justify-center rounded-lg"
        >
          Begin
        </Button>
      </>
    );
  } else if (current?.type === 'info') {
    content = (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
        <i
          className={`${current.iconClass ?? 'fa-solid fa-fire'} text-9xl`}
          style={{ color: current.color || 'red' }}
        />
        <h2 className="text-2xl font-semibold text-center">{current.title}</h2>
        <p className="text-gray-700 text-center">{current.message}</p>
        <Button
          onClick={() => setStepIndex(stepIndex + 1)}
          className="mt-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-md"
        >
          {current.button_label}
        </Button>
      </div>
    );
  } else if (current?.type === 'single_choice') {
    // Determine whether the selected answer is correct
    const userAnswer = answers[current.id];
    const isSingleCorrect = userAnswer === current.correctIndex;
    content = (
      <div>
        {/* Progress Header */}
        <div className="max-w-xl mx-auto flex items-center justify-between mb-6">
          {stepIndex > 0 ? (
            <button
              onClick={() => setStepIndex(stepIndex - 1)}
              className="inline-flex items-center text-blue-600 text-base font-semibold hover:text-blue-800"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className="flex-1 mx-4">
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500 transition-all ease-in-out"
                style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="text-center mt-1 text-sm font-medium text-blue-600">
              {stepIndex + 1} / {questions.length}
            </div>
          </div>
          <div className="w-5" />
        </div>
        {/* Question */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {current.iconClass && <i className={`${current.iconClass} text-3xl text-gray-500`} />}
          <h2 className="text-2xl font-semibold text-center">{current.question}</h2>
        </div>
        {/* Options */}
        <div className="space-y-4 max-w-xl mx-auto">
          {(current.options ?? []).map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full border rounded-lg p-4 flex items-center shadow-sm transition cursor-pointer hover:bg-gray-50 hover:shadow ${userAnswer === opt.value ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
            >
              {opt.iconPNG && (
                <div className="flex-shrink-0 w-12 h-12 mr-4">
                  <img src={opt.iconPNG} alt={opt.label} className="w-full h-full object-contain" />
                </div>
              )}
              {opt.imageUrl && (
                <div className="flex-shrink-0 w-12 h-12 mr-4 overflow-hidden bg-gray-100 rounded-lg">
                  <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover" />
                </div>
              )}
              {opt.iconClass && (
                <div className={`flex-shrink-0 w-12 h-12 mr-4 flex items-center justify-center ${userAnswer === opt.value ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg`}>
                  <i className={`${opt.iconClass} text-3xl ${userAnswer === opt.value ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
              )}
              <span className={`font-medium ${userAnswer === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</span>
            </button>
          ))}
        </div>
        {/* For single-choice with feedback, show Next button after checking */}
        {current.correctIndex !== undefined && isAnswerChecked && (
          <div className="mt-6 max-w-xl mx-auto flex justify-between items-center">
            {current.hint && (
              <Button variant="outline" onClick={() => setShowHint(prev => !prev)}>
                Hint
              </Button>
            )}
            <Button
              onClick={() => {
                const next = stepIndex + 1;
                if (next < questions.length) setStepIndex(next);
                else console.log('Quiz complete:', answers);
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md"
            >
              Next
            </Button>
          </div>
        )}
        {/* Show hint content below controls */}
        {showHint && current.hint && (
          <div className="max-w-xl mx-auto border-l-4 border-blue-500 bg-blue-50 p-4 rounded mb-6 mt-4">
            <p className="text-gray-700 italic">{current.hint}</p>
          </div>
        )}
        {/* Feedback: Correct or Incorrect for single-choice */}
        {isAnswerChecked && (
          isSingleCorrect ? current.explanation && (
            <div className="mt-6 mb-6 max-w-xl mx-auto border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <div className="flex items-center">
                <i className="fa-solid fa-circle-check text-green-500 mr-2" />
                <span className="text-green-700 font-semibold">Correct answer</span>
              </div>
              <p className="mt-2 text-gray-700">{current.explanation}</p>
            </div>
          ) : current.if_wrong && (
            <div className="mt-6 mb-6 max-w-xl mx-auto border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <div className="flex items-center">
                <i className="fa-solid fa-circle-xmark text-red-500 mr-2" />
                <span className="text-red-700 font-semibold">Incorrect answer</span>
              </div>
              <p className="mt-2 text-gray-700">{current.if_wrong}</p>
            </div>
          )
        )}
      </div>
    );
  } else if (current?.type === 'multi_choice') {
    // Determine multi-choice correctness
    const correctIndexes = current.correctIndexes || [];
    const selectedAnswers = (answers[current.id] as string[]) || [];
    const isMultiCorrect = selectedAnswers.length === correctIndexes.length &&
      correctIndexes.every(ci => selectedAnswers.includes(ci));
    content = (
      <div>
        {/* Progress Header */}
        <div className="max-w-xl mx-auto flex items-center justify-between mb-4">
          {stepIndex > 0 ? (
            <button
              onClick={() => setStepIndex(stepIndex - 1)}
              className="inline-flex items-center text-blue-600 text-base font-semibold hover:text-blue-800"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className="flex-1 mx-4">
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500 transition-all ease-in-out"
                style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="text-center mt-1 text-sm font-medium text-blue-600">
              {stepIndex + 1} / {questions.length}
            </div>
          </div>
          <div className="w-5" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {current.question}
        </h2>
        {current.note && (
          <p className="text-gray-600 text-center mb-6 italic">{current.note}</p>
        )}
        <div className="space-y-4 max-w-xl mx-auto">
          {(current.options ?? []).map(opt => {
            const selected = isOptionSelected(opt.value);
            let baseClasses = selected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200';
            if (selected) baseClasses = 'bg-blue-50 border-blue-300';
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full cursor-pointer ${baseClasses} hover:bg-gray-50 border rounded-lg p-4 flex items-center shadow-sm transition`}
              >
                {opt.iconPNG ? (
                  <div className="flex-shrink-0 w-12 h-12 mr-4">
                    <img src={opt.iconPNG} alt={opt.label} className="w-full h-full object-contain" />
                  </div>
                ) : opt.imageUrl ? (
                  <div className="flex-shrink-0 w-12 h-12 mr-4 overflow-hidden bg-gray-100 rounded-lg">
                    <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover" />
                  </div>
                ) : opt.iconClass ? (
                  <div className={`flex-shrink-0 w-12 h-12 mr-4 flex items-center justify-center ${selected ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg`}>
                    <i className={`${opt.iconClass} text-3xl ${selected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                ) : null}
                <span className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
        {/* Controls: Hint toggle and Check/Next for multi-choice */}
        {stepIndex < questions.length - 1 && (
          <div className="mt-6 max-w-xl mx-auto flex justify-between items-center">
            {current.hint && (
              <Button variant="outline" onClick={() => setShowHint(prev => !prev)}>
                Hint
              </Button>
            )}
            <Button
              onClick={handleMultiChoiceNext}
              disabled={!Array.isArray(answers[current.id]) || (answers[current.id] as string[]).length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md disabled:opacity-50"
            >
              {(current.correctIndexes?.length ?? 0) > 0 ? (isAnswerChecked ? 'Next' : 'Check') : 'Next'}
            </Button>
          </div>
        )}
        
        {/* Show hint content below controls */}
        {showHint && current.hint && (
          <div className="max-w-xl mx-auto border-l-4 border-blue-500 bg-blue-50 p-4 rounded mb-6 mt-4">
            <p className="text-gray-700 italic">{current.hint}</p>
          </div>
        )}
        
        {/* Feedback: Correct or Incorrect for multi-choice */}
        {isAnswerChecked && (
          isMultiCorrect ? current.explanation && (
            <div className="mt-6 mb-6 max-w-xl mx-auto border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <div className="flex items-center">
                <i className="fa-solid fa-circle-check text-green-500 mr-2" />
                <span className="text-green-700 font-semibold">Correct answer</span>
              </div>
              <p className="mt-2 text-gray-700">{current.explanation}</p>
            </div>
          ) : current.if_wrong && (
            <div className="mt-6 mb-6 max-w-xl mx-auto border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <div className="flex items-center">
                <i className="fa-solid fa-circle-xmark text-red-500 mr-2" />
                <span className="text-red-700 font-semibold">Incorrect answer</span>
              </div>
              <p className="mt-2 text-gray-700">{current.if_wrong}</p>
            </div>
          )
        )}
      </div>
    );
  } else if (current?.type === 'summary') {
    content = (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-4xl font-bold text-center">
          Your Personalised{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
            AI Career Freedom
          </span>{' '}
          Plan
        </h2>
        {current.subtitle && <p className="text-gray-700 text-center">Based on your answers...</p>}
        <div className="relative w-48 h-48 my-6">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
            <defs>
              <linearGradient id="quizGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3498db" />
                <stop offset="100%" stopColor="#2ecc71" />
              </linearGradient>
            </defs>
            <circle
              cx={50}
              cy={50}
              r={radius}
              stroke="#f0f0f0"
              strokeWidth={12}
              fill="none"
            />
            <circle
              cx={50}
              cy={50}
              r={radius}
              stroke="url(#quizGradient)"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(youP / 100) * circumference} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
            {youP}%
          </div>
        </div>
        <p className="text-gray-700 text-center">In just 4 weeks you'll be mastering AI and using it to achieve your goals:</p>
        
        {/* Chart */}
        <div className="chart-container" ref={chartContainerRef}>
          <div className="chart">
            {/* Grid lines */}
            <div className="grid-line" style={{ bottom: '0%' }}>
              <span className="percent-label">0</span>
            </div>
            <div className="grid-line" style={{ bottom: '50%' }}>
              <span className="percent-label">50%</span>
            </div>
            <div className="grid-line" style={{ bottom: '100%' }}>
              <span className="percent-label">100%</span>
            </div>
            
            {/* Bars */}
            <div className="bar bar-1" style={{ '--max-height': '60px' } as React.CSSProperties}>
              <div className="skill-badge badge-1">Beginner</div>
              <div className="x-label">W. 1</div>
            </div>
            
            <div className="bar bar-2" style={{ '--max-height': '125px' } as React.CSSProperties}>
              <div className="x-label">W. 2</div>
            </div>
            
            <div className="bar bar-3" style={{ '--max-height': '190px' } as React.CSSProperties}>
              <div className="x-label">W. 3</div>
            </div>
            
            <div className="bar bar-4" style={{ '--max-height': '230px' } as React.CSSProperties}>
              <div className="skill-badge badge-4">After 4 weeks </div>
              <div className="x-label">W. 4</div>
            </div>
            
            <div className="bar bar-5" style={{ '--max-height': '250px' } as React.CSSProperties}>
              <div className="skill-badge badge-3">AI Expert</div>
              <div className="x-label">W. 5</div>
            </div>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">This chart is for illustrative purposes only</p>
        
        <Button
          onClick={() => setStepIndex(progressBarsStep)}
          className="mt-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-md"
        >
          {current.button_label}
        </Button>
      </div>
    );
  } else if (stepIndex === progressBarsStep) {
    content = (
      <ProgressBarsStep onNext={() => setStepIndex(formInputStep)} />
    );
  } else if (stepIndex === formInputStep) {
    // Render form input JSON step
    content = (
      <div className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center">Unlock Your Personalized Growth Plan</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            setStepIndex(finalConfettiStep);
          }}
          className="space-y-4"
        >
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              value={formData.email || ''}
            />
          </div>
          <div className="flex items-center">
            <input
              id="newsletter_optin"
              name="newsletter_optin"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              onChange={e => setFormData({ ...formData, newsletter_optin: e.target.checked })}
              checked={!!formData.newsletter_optin}
            />
            <label htmlFor="newsletter_optin" className="ml-2 text-sm text-gray-700">
              Keep me informed with exclusive insights, tailored recommendations, and inspiring updates!
            </label>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start">
              <input
                id="terms_acceptance"
                name="terms_acceptance"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                onChange={e => setFormData({ ...formData, terms_acceptance: e.target.checked })}
                checked={!!formData.terms_acceptance}
              />
              <label htmlFor="terms_acceptance" className="ml-2 text-sm text-gray-700">
                I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Privacy Policy</a>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              By checking this box, you confirm that you have read and agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Privacy Policy</a>, which outline how we collect, use, and protect your personal information.
            </p>
          </div>
          <Button
            type="submit"
            disabled={!formData.terms_acceptance || !formData.email}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Get My Plan
          </Button>
        </form>
      </div>
    );
  } else if (stepIndex === finalConfettiStep) {
    content = (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">Congratulations!</h2>
        <p className="mt-4 text-lg text-gray-700">Your personalized learning journey is ready.</p>
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-md font-medium text-gray-800">We've tailored the perfect journey for your AI career goals</p>
          </div>
        </div>
        <Button
          className="mt-8 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-md"
          onClick={async () => { 
            const saved = await saveQuizData();
            // Even if save fails, still proceed to pricing
            window.location.href = '/pricing';
          }}
        >
          Next
        </Button>
      </div>
    );
  }
  return <div className="space-y-6">{content}</div>;
} 