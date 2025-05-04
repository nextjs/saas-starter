'use client';

import { useState, useEffect } from 'react';

export function Terminal() {
  const [text, setText] = useState('');
  const fullText = `$ npx create-next-app --example saas-starter my-saas-app
✓ Cloning template...
✓ Installing dependencies...
✓ Initializing project...

Success! Your SaaS starter is ready.

$ cd my-saas-app
$ npm run dev`;

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(typing);
      }
    }, 50);
    return () => clearInterval(typing);
  }, []);

  return (
    <div className="w-full h-80 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center h-6 bg-gray-800 px-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div className="p-4 h-full">
        <pre className="text-green-400 font-mono text-sm">
          <code>{text}</code>
          <span className="animate-pulse">_</span>
        </pre>
      </div>
    </div>
  );
}