'use client';

import { useState } from 'react';
import {
  Hammer,
  PenTool,
  Filter,
  Eye,
  Sparkles,
  Download,
  History,
  Check,
  RotateCcw,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Modular components
import { BuildTrack } from './BuildTrack';
import { EditTrack } from './EditTrack';
import { RefineTrack } from './RefineTrack';
import { ReviewTrack } from './ReviewTrack';
import { EnhanceTrack } from './EnhanceTrack';
import { ExportTrack } from './ExportTrack';

type Tab = 'BUILD' | 'EDIT' | 'REFINE' | 'REVIEW' | 'ENHANCE' | 'EXPORT';

interface LyricEditorProps {
  initialTitle: string;
  initialLyrics: string;
}

export function LyricEditor({ initialTitle, initialLyrics }: LyricEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('EDIT');
  const [title, setTitle] = useState(initialTitle);
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'BUILD': return <BuildTrack />;
      case 'EDIT': return null; // Editor is always shown or shown by default
      case 'REFINE': return <RefineTrack />;
      case 'REVIEW': return <ReviewTrack />;
      case 'ENHANCE': return <EnhanceTrack />;
      case 'EXPORT': return <ExportTrack />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'BUILD', icon: Hammer, label: 'Build' },
    { id: 'EDIT', icon: PenTool, label: 'Edit' },
    { id: 'REFINE', icon: Filter, label: 'Refine' },
    { id: 'REVIEW', icon: Eye, label: 'Review' },
    { id: 'ENHANCE', icon: Sparkles, label: 'Enhance' },
    { id: 'EXPORT', icon: Download, label: 'Export' },
  ] as const;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#050508] overflow-hidden relative">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard/library">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl bg-zinc-900/50 border border-zinc-800">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex flex-col min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-white font-black uppercase italic tracking-tight focus:ring-0 p-0 text-sm sm:text-xl w-full truncate"
            />
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
              {isSaving ? (
                <span className="flex items-center gap-1.5"><RotateCcw className="size-3 animate-spin" /> Saving...</span>
              ) : (
                <span className="flex items-center gap-1.5"><Check className="size-3 text-gold" /> Synced</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            variant="ghost"
            className="text-zinc-400 hover:text-white hidden sm:flex font-black uppercase tracking-widest text-[10px] bg-zinc-900/30 border border-zinc-900 px-4 h-10 rounded-xl"
          >
            <History className="size-4 mr-2 text-zinc-600" />
            History
          </Button>
          <Button className="bg-[#5850ec] text-white hover:bg-[#5850ec]/90 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg shadow-[#5850ec]/20">
            <Share2 className="size-4 sm:mr-2" />
            <span className="hidden sm:inline text-nowrap">Export Draft</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative pb-20 sm:pb-24">
        {/* Editor Main */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-[#050508] transition-all duration-300",
          activeTab !== 'EDIT' && "hidden lg:flex"
        )}>
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 lg:p-20 scrollbar-hide">
            <div className="max-w-3xl mx-auto">
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full bg-transparent text-zinc-300 font-mono text-base sm:text-xl focus:ring-0 border-none resize-none leading-[2.5] italic"
                placeholder="The first line of your next masterpiece..."
                rows={20}
              />
            </div>
          </div>

          {/* Editor Footer / Stats */}
          <div className="h-10 border-t border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
            <div className="flex gap-6">
              <span>Lines: {lyrics.split('\n').length}</span>
              <span>Words: {lyrics.split(/\s+/).filter(Boolean).length}</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="size-2 rounded-full bg-gold animate-pulse" />
               LIVE ANALYTICS
            </div>
          </div>
        </div>

        {/* Mobile Content View (when not on EDIT tab) */}
        <div className={cn(
          "flex-1 lg:hidden bg-[#050508] p-6 overflow-y-auto",
          activeTab === 'EDIT' && "hidden"
        )}>
           {renderActiveTabContent()}
        </div>

        {/* Right Sidebar - Desktop Tool View */}
        <div className="hidden lg:flex w-96 border-l border-zinc-900 bg-zinc-950 flex-col overflow-y-auto">
          <div className="p-8">
            {activeTab === 'EDIT' ? (
              <div className="space-y-6">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                  <PenTool className="size-4 text-gold fill-gold" />
                  EDITOR MODE
                </h3>
                <p className="text-xs text-zinc-400 italic">Select a tool from the bottom navigation to assist your writing.</p>
              </div>
            ) : renderActiveTabContent()}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Tabs) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f] border-t border-zinc-900 h-20 sm:h-24 flex items-center justify-around px-2 sm:px-10 z-[60]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-2 transition-all p-2 rounded-2xl min-w-[56px] sm:min-w-[64px]",
                isActive ? "text-[#5850ec] bg-[#5850ec]/10 shadow-[0_0_20px_rgba(88,80,236,0.1)]" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <Icon className={cn("size-5 sm:size-6", isActive && "stroke-[2.5px]")} />
              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
