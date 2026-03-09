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
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mx-auto mb-2">
      {/* Open notebook */}
      <rect x="15" y="25" width="40" height="50" rx="3" fill="#f5f0e8" stroke="#d4c9b8" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="55" y="25" width="40" height="50" rx="3" fill="#f5f0e8" stroke="#d4c9b8" strokeWidth="2" strokeDasharray="4,3"/>
      <line x1="55" y1="25" x2="55" y2="75" stroke="#d4c9b8" strokeWidth="2"/>
      {/* Lines on pages */}
      <line x1="22" y1="35" x2="48" y2="35" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="22" y1="42" x2="48" y2="42" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="22" y1="49" x2="45" y2="49" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="62" y1="35" x2="88" y2="35" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="62" y1="42" x2="88" y2="42" stroke="#ebe5d9" strokeWidth="1"/>
      <line x1="62" y1="49" x2="85" y2="49" stroke="#ebe5d9" strokeWidth="1"/>
      {/* Lightbulb above */}
      <ellipse cx="60" cy="14" rx="10" ry="11" fill="#f2d98b" stroke="#e07a5f" strokeWidth="1.5" strokeDasharray="3,2"/>
      <line x1="57" y1="12" x2="57" y2="7" stroke="#e07a5f" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="63" y1="12" x2="63" y2="7" stroke="#e07a5f" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M56,16 Q60,22 64,16" stroke="#e07a5f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Sparkle */}
      <circle cx="78" cy="10" r="2" fill="#7c9a6e"/>
      <circle cx="42" cy="18" r="1.5" fill="#6b8cae"/>
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
