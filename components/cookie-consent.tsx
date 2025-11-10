'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', 'necessary');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent">
      <Card className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Vi bruker cookies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Vi bruker cookies for å forbedre din opplevelse på nettsiden vår. Ved å fortsette
              å bruke denne nettsiden, godtar du vår bruk av cookies.{' '}
              <Link href="/privacy" className="text-orange-500 hover:underline">
                Les mer i vår personvernerklæring
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={acceptAll}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Aksepter alle cookies
              </Button>
              <Button
                onClick={acceptNecessary}
                variant="outline"
              >
                Kun nødvendige
              </Button>
            </div>
          </div>
          <button
            onClick={acceptNecessary}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
