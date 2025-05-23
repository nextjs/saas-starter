'use client';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogTest() {
  const [status, setStatus] = useState('Loading...');
  const [apiKey, setApiKey] = useState('');
  const [host, setHost] = useState('');
  const [eventResult, setEventResult] = useState('');
  const [initStatus, setInitStatus] = useState('');

  // Check if PostHog is initialized
  useEffect(() => {
    // Show environment variables (in a safe way)
    const key = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
    const hostValue = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
    
    if (key) {
      setApiKey(`${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
    } else {
      setApiKey('Not set');
    }
    
    setHost(hostValue);
    
    // Check if PostHog is loaded
    if (posthog.__loaded) {
      setStatus('PostHog initialized ✅');
      console.log('PostHog is loaded:', posthog.__loaded);
      console.log('PostHog person properties:', posthog.get_property('$distinct_id'));
    } else {
      setStatus('PostHog NOT initialized ❌');
      console.log('PostHog not loaded, will attempt to initialize');
      
      if (key) {
        try {
          posthog.init(key, {
            api_host: hostValue,
            loaded: (ph) => {
              console.log('Manual PostHog initialization successful:', ph.__loaded);
              setStatus('PostHog manually initialized ✅');
              setInitStatus('Successfully initialized PostHog manually');
            }
          });
        } catch (err) {
          console.error('Error initializing PostHog:', err);
          setInitStatus(`Error initializing: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  }, []);

  // Send a test event
  const sendTestEvent = () => {
    try {
      posthog.capture('test_event', { testProperty: 'test_value', timestamp: new Date().toISOString() });
      setEventResult('Event sent! Check your PostHog dashboard');
      console.log('Test event sent to PostHog');
    } catch (err) {
      console.error('Error sending event:', err);
      setEventResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">PostHog Test Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Configuration</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="font-medium">API Key:</div>
          <div>{apiKey}</div>
          <div className="font-medium">Host:</div>
          <div>{host}</div>
        </div>
        <div className="text-lg font-semibold p-2 bg-gray-100 rounded">
          Status: {status}
        </div>
        {initStatus && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            {initStatus}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Network Test</h2>
        <button 
          onClick={sendTestEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Test Event
        </button>
        {eventResult && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            {eventResult}
          </div>
        )}
      </div>
      
      <div className="text-sm bg-gray-50 p-4 rounded mt-6">
        <h3 className="font-semibold mb-1">Debugging Tips:</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Check browser console for errors</li>
          <li>Verify your NEXT_PUBLIC_POSTHOG_API_KEY in .env.local</li>
          <li>Ensure no ad-blockers or privacy extensions are blocking analytics</li>
          <li>Check your network tab to see if requests to PostHog are succeeding</li>
        </ul>
      </div>
    </div>
  );
} 