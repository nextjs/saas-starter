'use client';
import { useState, useEffect } from 'react';

export default function DirectPostHogTest() {
  const [result, setResult] = useState('Oczekiwanie...');
  const [loading, setLoading] = useState(false);
  
  const API_KEY = 'phc_hX3OAIHMbd2tF40deCXLFyQWwHWnP3mExxsOSa4dNtJ'; // Testowy klucz
  const HOST = 'https://eu.i.posthog.com';
  const PROJECT_ID = '11442'; // Domyślne ID projektu dla tego klucza
  
  const sendDirectEvent = async () => {
    setLoading(true);
    setResult('Wysyłanie...');
    
    const distinctId = 'test-user-' + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();
    
    try {
      const response = await fetch(`${HOST}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: API_KEY,
          event: 'direct_test_event',
          properties: {
            distinct_id: distinctId,
            time: timestamp,
            $browser: 'bezpośredni test',
            testProperty: 'wartość testowa',
            $lib: 'custom-fetch',
          },
          timestamp: timestamp,
        }),
      });

      const data = await response.text();
      console.log('PostHog response:', data);
      setResult(`Event wysłany bezpośrednio! Response: ${data || 'OK'}`);
    } catch (error) {
      console.error('Błąd podczas wysyłania eventu:', error);
      setResult(`Błąd: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const sendCaptureFetch = async () => {
    setLoading(true);
    setResult('Wysyłanie...');
    
    const distinctId = 'test-user-' + Math.floor(Math.random() * 1000);
    
    try {
      const response = await fetch(`${HOST}/api/projects/${PROJECT_ID}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          distinct_id: distinctId,
          event: 'api_test_event',
          properties: {
            time: new Date().toISOString(),
            testingMethod: 'API',
            source: 'manual test'
          }
        }),
      });

      const data = await response.text();
      console.log('PostHog API response:', data);
      setResult(`Event wysłany przez API! Response: ${data || 'OK'}`);
    } catch (error) {
      console.error('Błąd podczas wysyłania eventu przez API:', error);
      setResult(`Błąd API: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const sendJSEvent = () => {
    setLoading(true);
    setResult('Wysyłanie przez JavaScript...');
    
    // Dodaj skrypt PostHog bezpośrednio na stronę
    const script = document.createElement('script');
    script.src = 'https://eu.i.posthog.com/static/array.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.posthog.init(API_KEY, {
        api_host: HOST,
        loaded: (posthog: any) => {
          console.log('PostHog załadowany przez script tag:', posthog);
          // @ts-ignore
          window.posthog.capture('js_test_event', {
            testProperty: 'wartość z JS',
            timestamp: new Date().toISOString()
          });
          setResult('Event wysłany przez JavaScript!');
          setLoading(false);
        },
        capture_pageview: false
      });
    };
    script.onerror = (err) => {
      console.error('Błąd ładowania skryptu:', err);
      setResult('Błąd ładowania skryptu PostHog');
      setLoading(false);
    };
    
    document.head.appendChild(script);
  };

  return (
    <div className="p-8 max-w-xl mx-auto mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Bezpośredni Test PostHog</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Konfiguracja</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="font-medium">API Key:</div>
          <div>{API_KEY}</div>
          <div className="font-medium">Host:</div>
          <div>{HOST}</div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Testy</h2>
        
        <div className="space-y-4">
          <div>
            <button 
              onClick={sendDirectEvent}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              Wyślij przez Fetch (Capture)
            </button>
          </div>
          
          <div>
            <button 
              onClick={sendCaptureFetch}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              Wyślij przez API
            </button>
          </div>
          
          <div>
            <button 
              onClick={sendJSEvent}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
            >
              Wyślij przez JavaScript
            </button>
          </div>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            {result}
          </div>
        )}
      </div>
      
      <div className="text-sm bg-gray-50 p-4 rounded mt-6">
        <h3 className="font-semibold mb-1">Uwagi:</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Ta strona używa bezpośrednich metod do wysyłania eventów</li>
          <li>Używamy tymczasowego klucza do testów</li>
          <li>Sprawdź konsolę po kliknięciu przycisków, aby zobaczyć więcej informacji</li>
          <li>Otwórz Network tab w DevTools, aby zobaczyć czy zapytania przechodzą</li>
        </ul>
      </div>
    </div>
  );
} 