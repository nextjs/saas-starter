'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Conversation } from '@/components/ui/conversation';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export default function BotPage() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Interview Call
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

