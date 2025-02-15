'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function BotPage() {
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (isListening) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput(transcript);
        setCharCount(transcript.length);
        handleSend(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      recognitionRef.current?.stop();
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isListening]);

  const handleSend = async (message: string) => {
    try {
      setMessages((prevMessages) => [...prevMessages, `User: ${message}`]);

      const response = await fetch('/api/openAiTile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, `Bot: ${data.result}`]);

      // Play the audio response
      const audio = new Audio(data.audioUrl);
      audio.play();

      setInput('');
    } catch (error) {
      console.error('Error sending message to bot:', error);
    }
  };

  const disconnectMicrophone = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Cold Call Roleplay
      </h1>
      <Card>
        <CardContent>
          <div className="mb-4">
            <Button className="mb-4" onClick={() => setIsListening(!isListening)}>
              {isListening ? 'Stop Listening' : 'Connect to Bot'}
            </Button>
            {isListening && (
              <Button className="mb-4 ml-2" onClick={disconnectMicrophone}>
                End Recording
              </Button>
            )}
            <div
             
              className="h-96 overflow-y-auto border p-2 mb-4"
              onWheel={(e) => e.stopPropagation()}
              id="messageContainer"
              ref={(el) => {
                if (el) {
                  el.scrollTop = el.scrollHeight;
                }
              }}
            >
              {messages.map((message, index) => (
                <div key={index} className="mb-2">
                  <Label>{message}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 mr-2"
            />
            <Button onClick={() => handleSend(input)}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

