'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectionModal } from '@/components/studio/selection-modal';
import { QuickStartProcessing } from './Processing';
import { QuickStartResults } from './Results';
import {
  GENRE_CATEGORIES,
  INSTRUMENT_CATEGORIES,
  THEME_CATEGORIES,
  VOCAL_CATEGORIES
} from './types';

// Modular Components
import { GenreSelection } from './GenreSelection';
import { InstrumentSelection } from './InstrumentSelection';
import { ThemeSelection } from './ThemeSelection';
import { VocalSelection } from './VocalSelection';
import { LyricSelection } from './LyricSelection';
import { ProjectSelection } from './ProjectSelection';
import { SuggestedPrompts } from './SuggestedPrompts';
import { SparkButton } from './SparkButton';
import { EnhanceButton } from './EnhanceButton';
import { PolishButton } from './PolishButton';

type Step = 'INPUT' | 'PROCESSING' | 'RESULTS';
type ModalType = 'GENRE' | 'INSTRUMENT' | 'THEME' | 'VOCALS' | 'LYRICS' | 'PROJECT';

export function QuickStart() {
  const [step, setStep] = useState<Step>('INPUT');
  const [inputText, setInputText] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selections, setSelections] = useState({
    GENRE: [] as string[],
    INSTRUMENT: [] as string[],
    THEME: [] as string[],
    VOCALS: [] as string[],
    LYRICS: [] as string[],
    PROJECT: [] as string[],
  });

  const handleGenerate = () => {
    setStep('PROCESSING');
  };

  const handleConfirmSelection = (tags: string[]) => {
    if (activeModal) {
      setSelections(prev => ({ ...prev, [activeModal]: tags }));
      setActiveModal(null);
    }
  };

  const updatePrompt = (addition: string) => {
    setInputText(prev => prev ? `${prev} ${addition}` : addition);
  };

  if (step === 'PROCESSING') {
    return <QuickStartProcessing onComplete={() => setStep('RESULTS')} />;
  }

  if (step === 'RESULTS') {
    return (
      <QuickStartResults
        onReset={() => setStep('INPUT')}
        selections={selections}
        prompt={inputText}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <GenreSelection
          selectedTags={selections.GENRE}
          onClick={() => setActiveModal('GENRE')}
        />
        <InstrumentSelection
          selectedTags={selections.INSTRUMENT}
          onClick={() => setActiveModal('INSTRUMENT')}
        />
        <ThemeSelection
          selectedTags={selections.THEME}
          onClick={() => setActiveModal('THEME')}
        />
        <VocalSelection
          selectedTags={selections.VOCALS}
          onClick={() => setActiveModal('VOCALS')}
        />
        <LyricSelection
          selectedTags={selections.LYRICS}
          onClick={() => setActiveModal('LYRICS')}
        />
        <ProjectSelection
          selectedTags={selections.PROJECT}
          onClick={() => setActiveModal('PROJECT')}
        />
      </div>

      {/* Action Presets */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <SparkButton onClick={() => updatePrompt("Spark some creativity with unique textures.")} />
        <EnhanceButton onClick={() => updatePrompt("Make my idea more cinematic.")} />
        <PolishButton onClick={() => updatePrompt("Add professional mastering and spatial audio.")} />
      </div>

      {/* Prompt Input */}
      <div className="relative mb-10 group">
        <div className="bg-[#050508] border-2 border-zinc-900 rounded-[2.5rem] p-10 min-h-[220px] transition-all focus-within:border-zinc-700 group-hover:border-zinc-800">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, 500))}
            placeholder="What are we creating today?"
            className="w-full bg-transparent border-none text-white placeholder:text-zinc-800 focus:ring-0 resize-none text-xl sm:text-4xl font-black italic uppercase leading-tight"
          />
          <div className="absolute bottom-10 right-10 text-[10px] font-black text-zinc-800 tracking-widest uppercase">
            {inputText.length}/500
          </div>
        </div>
      </div>

      {/* Inspirations */}
      <SuggestedPrompts onSelect={setInputText} />

      {/* Generate Button */}
      <div className="mt-12">
        <Button
          onClick={handleGenerate}
          disabled={!inputText}
          className="w-full h-24 sm:h-32 rounded-[2.5rem] bg-[#5850ec] hover:bg-[#5850ec]/90 text-white font-black tracking-[0.6em] text-sm sm:text-2xl uppercase transition-all shadow-2xl shadow-[#5850ec]/20 active:scale-[0.98] disabled:opacity-20"
        >
          GENERATE TRACK
        </Button>
      </div>

      {/* Modals */}
      <SelectionModal
        title="SELECT GENRE"
        isOpen={activeModal === 'GENRE'}
        onClose={() => setActiveModal(null)}
        categories={GENRE_CATEGORIES}
        selectedTags={selections.GENRE}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT INSTRUMENTS"
        isOpen={activeModal === 'INSTRUMENT'}
        onClose={() => setActiveModal(null)}
        categories={INSTRUMENT_CATEGORIES}
        selectedTags={selections.INSTRUMENT}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT THEME / MOOD"
        isOpen={activeModal === 'THEME'}
        onClose={() => setActiveModal(null)}
        categories={THEME_CATEGORIES}
        selectedTags={selections.THEME}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT VOCAL STYLE"
        isOpen={activeModal === 'VOCALS'}
        onClose={() => setActiveModal(null)}
        categories={VOCAL_CATEGORIES}
        selectedTags={selections.VOCALS}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT LYRICS"
        isOpen={activeModal === 'LYRICS'}
        onClose={() => setActiveModal(null)}
        categories={{ 'STYLE': ['AI GENERATED', 'MANUAL INPUT', 'IMPORT'], 'MOOD': ['HAPPY', 'SAD', 'ANGRY'] }}
        selectedTags={selections.LYRICS}
        onConfirm={handleConfirmSelection}
      />
      <SelectionModal
        title="SELECT PROJECT"
        isOpen={activeModal === 'PROJECT'}
        onClose={() => setActiveModal(null)}
        categories={{ 'RECENT': ['DEFAULT STUDIO', 'ALBUM 2024', 'FILM SCORE'], 'ARCHIVE': ['OLD SKETCHES', 'TESTS'] }}
        selectedTags={selections.PROJECT}
        onConfirm={handleConfirmSelection}
      />
    </div>
  );
}
