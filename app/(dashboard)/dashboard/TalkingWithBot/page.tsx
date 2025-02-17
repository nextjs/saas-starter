'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Conversation } from '@/components/ui/conversation';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

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

  useEffect(() => {
    const videoElement = document.getElementById('webcam') as HTMLVideoElement;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoElement.srcObject = stream;
        })
        .catch((error) => {
          console.error('Error accessing webcam:', error);
        });
    }

    return () => {
      if (videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Cold Call Roleplay
      </h1>
      
      <Card>
        <CardContent>
            <div className="flex mb-4">
            <div className="flex flex-col w-1/3 mr-4 hidden lg:flex">
              <Card className="mb-4">
              <CardContent>
              <div className="mb-4">
              </div>
              <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Bot Picture Placeholder</span>
              </div>
              </CardContent>
              </Card>
             
            </div>
            <Card className="flex-2 lg:w-1/3">
              <CardContent>
              <div className="h-full flex flex-col">
              <div className="flex-1 mb-4">
              <div className="mb-4">
              </div>
              <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
              <Conversation />
              </div>
              </div>
              <div className="flex items-center">
            
              </div>
             
              </div>
              <div className="h-75
              ">
              <video id="webcam" className="w-full h-24 lg:h-70 bg-gray-200" autoPlay playsInline></video>
              </div>
              </CardContent>
            </Card>
            </div>
          
        </CardContent>
      </Card>
    </section>
  );
}

