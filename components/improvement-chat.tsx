'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Copy, Check, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ImprovementType = 'prompt' | 'email';

export function ImprovementChat() {
  const router = useRouter();
  const [mode, setMode] = useState<ImprovementType>('prompt');
  const [inputText, setInputText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(3); // Default for anonymous users
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Vennligst skriv inn tekst å forbedre');
      return;
    }

    if (usageCount >= usageLimit) {
      setError('Du har nådd din daglige grense. Registrer deg for flere forbedringer!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          type: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.message || 'Daglig grense nådd. Registrer deg for flere forbedringer!');
          return;
        }
        throw new Error(data.error || 'Noe gikk galt');
      }

      setImprovedText(data.improvedText);
      setUsageCount(data.usageCount);
      setUsageLimit(data.usageLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setImprovedText('');
    setError('');
  };

  const remainingUses = usageLimit - usageCount;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
          <button
            onClick={() => setMode('prompt')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'prompt'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Prompt
          </button>
          <button
            onClick={() => setMode('email')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'email'
                ? 'bg-orange-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Mail className="h-4 w-4" />
            E-post
          </button>
        </div>
      </div>

      {/* Usage Counter */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Gjenværende forbedringer i dag: <span className="text-orange-600 font-bold">{remainingUses}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {usageLimit === 3
                ? 'Registrer deg for å få 5 ekstra forbedringer!'
                : 'Oppgrader for ubegrensede forbedringer'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/sign-up')}
            className="bg-white"
          >
            {usageLimit === 3 ? 'Registrer deg' : 'Oppgrader'}
          </Button>
        </div>
      </Card>

      {/* Input Area */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'prompt' ? 'Din prompt' : 'Din e-post'}
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            mode === 'prompt'
              ? 'Lim inn din prompt her for å forbedre den...'
              : 'Lim inn din e-post her for å forbedre den...'
          }
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          disabled={isLoading}
        />

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !inputText.trim() || remainingUses <= 0}
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Forbedrer...
              </>
            ) : (
              'Forbedre tekst'
            )}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={isLoading}
          >
            Tøm
          </Button>
        </div>
      </Card>

      {/* Results Area */}
      {improvedText && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Forbedret {mode === 'prompt' ? 'prompt' : 'e-post'}
            </label>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Kopier
                </>
              )}
            </Button>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap">{improvedText}</p>
          </div>
        </Card>
      )}

      {/* CTA for registration */}
      {usageCount >= usageLimit && (
        <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <h3 className="text-lg font-semibold mb-2">
            Du har brukt opp dine gratis forbedringer i dag!
          </h3>
          <p className="mb-4">
            Registrer deg for å få 5 ekstra forbedringer nå, og 4 forbedringer hver dag fremover.
          </p>
          <Button
            onClick={() => router.push('/sign-up')}
            variant="outline"
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            Registrer deg gratis
          </Button>
        </Card>
      )}
    </div>
  );
}
