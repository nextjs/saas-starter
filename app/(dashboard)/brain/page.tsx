import { StrategyPanel } from '@/components/brain/strategy-panel';
import { ChatPanel } from '@/components/brain/chat-panel';
import {
  getGoals,
  getStrategy,
  getPlaybook,
  getChatSessions,
  getChatMessages,
  getActiveSession,
} from '@/lib/mock-data-helpers';

function BrainIllustration() {
  return (
    <svg width="150" height="95" viewBox="0 0 150 95" fill="none" className="mx-auto mb-2 sketch-sway">
      {/* Scribble doodles in corners */}
      <path d="M5,80 Q8,76 12,80" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      <path d="M138,75 Q141,72 145,76" stroke="#d4c9b8" strokeWidth="0.8" fill="none" />
      {/* Open notebook - slightly larger */}
      <rect x="20" y="30" width="50" height="55" rx="3" fill="#f5f0e8" stroke="#d4c9b8" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="70" y="30" width="50" height="55" rx="3" fill="#f5f0e8" stroke="#d4c9b8" strokeWidth="2" strokeDasharray="4,3"/>
      <line x1="70" y1="30" x2="70" y2="85" stroke="#d4c9b8" strokeWidth="2"/>
      {/* Bookmark ribbon */}
      <path d="M112,30 L112,20 L116,24 L120,20 L120,30" fill="#e07a5f" opacity="0.6" stroke="#e07a5f" strokeWidth="0.5"/>
      {/* Lines on pages */}
      <line x1="27" y1="42" x2="62" y2="42" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="27" y1="50" x2="62" y2="50" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="27" y1="58" x2="58" y2="58" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="27" y1="66" x2="55" y2="66" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="77" y1="42" x2="112" y2="42" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="77" y1="50" x2="112" y2="50" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="77" y1="58" x2="108" y2="58" stroke="#ebe5d9" strokeWidth="1"/>
      {/* Red margin lines */}
      <line x1="30" y1="30" x2="30" y2="85" stroke="#e07a5f" strokeWidth="0.6" opacity="0.3" strokeDasharray="3,2"/>
      <line x1="80" y1="30" x2="80" y2="85" stroke="#e07a5f" strokeWidth="0.6" opacity="0.3" strokeDasharray="3,2"/>
      {/* Lightbulb above - bigger */}
      <ellipse cx="70" cy="14" rx="13" ry="14" fill="#f2d98b" stroke="#e07a5f" strokeWidth="1.5" strokeDasharray="3,2"/>
      <line x1="66" y1="12" x2="66" y2="5" stroke="#e07a5f" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="74" y1="12" x2="74" y2="5" stroke="#e07a5f" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M64,18 Q70,26 76,18" stroke="#e07a5f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Rays from lightbulb */}
      <line x1="55" y1="8" x2="52" y2="4" stroke="#f2d98b" strokeWidth="1" strokeLinecap="round"/>
      <line x1="85" y1="8" x2="88" y2="4" stroke="#f2d98b" strokeWidth="1" strokeLinecap="round"/>
      <line x1="70" y1="-1" x2="70" y2="-5" stroke="#f2d98b" strokeWidth="1" strokeLinecap="round"/>
      {/* Sparkles - more */}
      <circle cx="98" cy="10" r="2.5" fill="#7c9a6e"/>
      <circle cx="42" cy="18" r="2" fill="#6b8cae"/>
      <circle cx="130" cy="40" r="1.5" fill="#e07a5f" opacity="0.6"/>
      <circle cx="8" cy="45" r="1.5" fill="#f2d98b" opacity="0.5"/>
      {/* Tiny star doodle */}
      <path d="M15,20 L16.5,16 L18,20 L14.5,17.5 L19.5,17.5 Z" fill="#e07a5f" opacity="0.35"/>
    </svg>
  );
}

export default function BrainPage() {
  const goals = getGoals();
  const strategy = getStrategy();
  const playbook = getPlaybook();
  const sessions = getChatSessions();
  const activeSession = getActiveSession();
  const activeSessionId = activeSession?.id ?? sessions[0]?.id ?? '';
  const messages = getChatMessages(activeSessionId);

  return (
    <div className="flex h-full flex-col md:flex-row">
      <StrategyPanel
        goals={goals}
        strategy={strategy}
        playbook={playbook.active ? playbook : null}
      />

      <ChatPanel
        sessions={sessions}
        initialMessages={messages}
        initialSessionId={activeSessionId}
        illustration={<BrainIllustration />}
      />
    </div>
  );
}
