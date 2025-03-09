'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';

export function Terminal() {
  const [terminalStep, setTerminalStep] = React.useState<number>(0);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  const terminalSteps = [
    'git clone https://github.com/nextjs/saas-starter',
    'pnpm install',
    'pnpm db:setup',
    'pnpm db:migrate',
    'pnpm db:seed',
    'pnpm dev 🎉',
  ];

  React.useEffect(() => {
    try {
      const timer = setTimeout(() => {
        const nextStep = terminalStep < terminalSteps.length - 1 ? terminalStep + 1 : terminalStep;
        setTerminalStep(nextStep);
      }, 500);

      return () => clearTimeout(timer);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error in Terminal component:', err);
    }
  }, [terminalStep, terminalSteps.length]);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(terminalSteps.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // If there's an error, display a fallback UI
  if (error) {
    return (
      <div className="w-full rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white font-mono text-sm p-4">
        <p className="text-red-500">Error loading terminal animation</p>
        <div className="mt-2">
          {terminalSteps.map((step, index) => (
            <div key={index}>
              <span className="text-green-400">$</span> {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white font-mono text-sm relative">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="space-y-2">
          {terminalSteps.map((step, index) => (
            <div
              key={index}
              className={`${index > terminalStep ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            >
              <span className="text-green-400">$</span> {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
