import type {
  Identity,
  FlowItem,
  CalendarSlot,
  MonitorFeedItem,
  MonitorConfig,
  MonitorAlert,
  ChatSession,
  ChatMessage,
  Goal,
  GoalProgress,
  ScheduledPost,
  ReplyTrackerItem,
  TopContent,
} from './types';
import { FlowItemType } from './types';
import {
  identities,
  currentIdentityId,
  activeSessionId,
  flowItems,
  calendarSlots,
  monitorFeedItems,
  monitors,
  monitorAlerts,
  chatSessions,
  chatMessages,
  goals,
  goalProgressData,
  replyTrackerItems,
  topContent,
  worstContent,
  strategy,
  strategyHealth,
  aiInsights,
  platformStats,
  performanceData,
  aiLearningProgress,
  learnedPatterns,
  playbook,
  autoReplyRules,
  notificationPreferences,
  teamMembers,
} from './mock-data';

// ============================================================================
// Identity
// ============================================================================

export function getCurrentIdentity(): Identity {
  return identities.find(i => i.id === currentIdentityId) ?? identities[0];
}

export function getIdentities(): Identity[] {
  return identities;
}

export function getIdentityById(id: string): Identity | undefined {
  return identities.find(i => i.id === id);
}

// ============================================================================
// Flow
// ============================================================================

export function getFlowItems(filter?: FlowItemType): FlowItem[] {
  const items = flowItems.filter(i => i.identityId === currentIdentityId);
  const filtered = filter ? items.filter(i => i.type === filter) : items;
  return filtered.sort((a, b) => a.priority - b.priority);
}

export function getFlowItemById(id: string): FlowItem | undefined {
  return flowItems.find(i => i.id === id);
}

// ============================================================================
// Calendar
// ============================================================================

export function getCalendarSlots(weekStart?: Date): CalendarSlot[] {
  if (!weekStart) return calendarSlots;

  return calendarSlots.filter(slot => {
    const slotTime = slot.date.getTime();
    const startTime = weekStart.getTime();
    const endTime = startTime + 7 * 24 * 60 * 60 * 1000;
    return slotTime >= startTime && slotTime < endTime;
  });
}

export function getScheduledPosts(status?: ScheduledPost['status']): ScheduledPost[] {
  const allPosts = calendarSlots.flatMap(s => s.posts);
  if (!status) return allPosts;
  return allPosts.filter(p => p.status === status);
}

// ============================================================================
// Monitor
// ============================================================================

export function getMonitors(): MonitorConfig[] {
  return monitors.filter(m => m.identityId === currentIdentityId || m.identityId === 'id-deely');
}

export function getMonitorAlerts(): MonitorAlert[] {
  return monitorAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getMonitorFeed(filter?: string): MonitorFeedItem[] {
  const items = filter
    ? monitorFeedItems.filter(i => i.tag === filter || i.platform === filter)
    : monitorFeedItems;
  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getReplyTrackerItems(): ReplyTrackerItem[] {
  return replyTrackerItems.filter(i => i.identityId === currentIdentityId);
}

// ============================================================================
// Brain
// ============================================================================

export function getChatSessions(): ChatSession[] {
  const sessions = chatSessions.filter(s => s.identityId === currentIdentityId);
  return sessions.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
  });
}

export function getActiveSession(): ChatSession | undefined {
  return chatSessions.find(s => s.id === activeSessionId);
}

export function getChatMessages(sessionId: string): ChatMessage[] {
  return chatMessages
    .filter(m => m.sessionId === sessionId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// ============================================================================
// Goals & Strategy
// ============================================================================

export function getGoals(identityId?: string): Goal[] {
  return goals.filter(g => g.identityId === (identityId ?? currentIdentityId));
}

export function getGoalProgress(): GoalProgress[] {
  return goalProgressData;
}

export function getStrategy() {
  return strategy;
}

export function getPlaybook() {
  return playbook;
}

// ============================================================================
// Pulse
// ============================================================================

export function getStrategyHealth() {
  return strategyHealth;
}

export function getAIInsights() {
  return aiInsights;
}

export function getTopContent(): TopContent[] {
  return topContent;
}

export function getWorstContent(): TopContent[] {
  return worstContent;
}

export function getPlatformStats() {
  return platformStats;
}

export function getPerformanceData() {
  return performanceData;
}

export function getAILearningProgress() {
  return aiLearningProgress;
}

export function getLearnedPatterns() {
  return learnedPatterns.filter(p => p.identityId === currentIdentityId);
}

// ============================================================================
// Settings
// ============================================================================

export function getAutoReplyRules() {
  return autoReplyRules.filter(r => r.identityId === currentIdentityId);
}

export function getNotificationPreferences() {
  return notificationPreferences;
}

// ============================================================================
// Team
// ============================================================================

export function getTeamMembers() {
  return teamMembers;
}
