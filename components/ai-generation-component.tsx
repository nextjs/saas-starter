'use client';

import { useState } from 'react';
import { useCreditCheck } from './credits/use-credit-check';

interface AIGenerationComponentProps {
  teamId: number;
}

export function AIGenerationComponent({ teamId }: AIGenerationComponentProps) {
  const [prompt, setPrompt] = useState('');
  const { hasSufficientCredits, loading } = useCreditCheck(teamId, 10);

  const handleGenerate = async () => {
    if (!hasSufficientCredits) {
      alert('Insufficient credits');
      return;
    }

    // Proceed with generation
    const response = await fetch('/api/ai-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamId, prompt }),
    });

    // Handle response
    const data = await response.json();
    if (response.ok) {
      alert(`Success: ${data.result}`);
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt"
      />
      <button
        onClick={handleGenerate}
        disabled={!hasSufficientCredits || loading}
      >
        Generate (10 credits)
      </button>
      {loading && <p>Checking credit balance...</p>}
      {!loading && !hasSufficientCredits && <p>You have insufficient credits.</p>}
    </div>
  );
}
