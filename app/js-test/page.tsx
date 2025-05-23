'use client';
import { useEffect, useRef, useState } from 'react';

export default function JsTest() {
  const [status, setStatus] = useState('Not initialized');
  const initialized = useRef(false);
  const [eventSent, setEventSent] = useState(false);

  // Inject PostHog script directly
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setStatus('Loading PostHog script...');
    const script = document.createElement('script');
    script.src = 'https://eu.i.posthog.com/static/array.js';
    script.async = true;
    
    script.onload = () => {
      try {
        setStatus('Script loaded, initializing...');
        // @ts-ignore
        window.posthog.init('phc_hX3OAIHMbd2tF40deCXLFyQWwHWnP3mExxsOSa4dNtJ', {
          api_host: 'https://eu.i.posthog.com',
          capture_pageview: true,
          loaded: function(posthog) {
            setStatus('PostHog initialized: ' + posthog.__loaded);
            console.log('PostHog loaded via script:', posthog.__loaded);
          }
        });
      } catch (err) {
        setStatus('Error initializing: ' + (err instanceof Error ? err.message : String(err)));
        console.error('PostHog init error:', err);
      }
    };
    
    script.onerror = (err) => {
      setStatus('Failed to load script');
      console.error('Script loading error:', err);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup if needed
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const captureEvent = () => {
    try {
      // @ts-ignore
      if (window.posthog) {
        // @ts-ignore
        window.posthog.capture('button_clicked', { 
          button: 'test',
          time: new Date().toISOString()
        });
        setEventSent(true);
        console.log('Event sent via direct script');
      } else {
        console.error('PostHog not available');
      }
    } catch (err) {
      console.error('Error sending event:', err);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto my-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Prosty test PostHog JS</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p><strong>Status:</strong> {status}</p>
      </div>
      
      <button 
        onClick={captureEvent}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Wyślij event
      </button>
      
      {eventSent && (
        <div className="mt-3 p-2 bg-green-100 text-green-800 rounded">
          Event został wysłany! Sprawdź konsolę i dashboard PostHog.
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Ten test używa skryptu PostHog załadowanego bezpośrednio przez script tag.</p>
        <p>Otwórz narzędzia deweloperskie (F12) i sprawdź zakładkę Network, aby zobaczyć czy zapytania są wysyłane.</p>
      </div>
    </div>
  );
} 