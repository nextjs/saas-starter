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
      />
    </div>
  );
}
