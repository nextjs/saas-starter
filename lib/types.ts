// ============================================================================
// Identity / Multi-brand
// ============================================================================

export interface VoiceParams {
  formality: number; // 0-100
  technicality: number;
  humor: number;
  assertiveness: number;
  emojiUsage: number;
}

export interface ContentPillar {
  id: string;
  name: string;
  description: string;
  allocation: number; // percentage, all pillars sum to 100
  color: string;
}

export interface BrandVoiceProfile {
  voiceParams: VoiceParams;
  contentPillars: ContentPillar[];
  preferredFormats: { format: string; weight: number }[];
  rules: string[];
  anchors: string[]; // example phrases that capture the voice
}

export interface Identity {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  type: 'personal' | 'company' | 'product';
  platforms: string[];
  brandVoice: BrandVoiceProfile;
  createdAt: Date;
}

// ============================================================================
// Goals & Strategy
// ============================================================================

export type GoalType = 'follower_growth' | 'engagement_rate' | 'posting_frequency' | 'pipeline';

export type GoalPace = 'on_track' | 'behind' | 'ahead';

export interface Goal {
  id: string;
  identityId: string;
  title: string;
  type: GoalType;
  target: number;
  current: number;
  progress: number; // 0-100
  pace: GoalPace;
  unit: string;
  platform?: string;
  deadline: Date;
  createdAt: Date;
}

export interface CadenceTarget {
  platform: string;
  postsPerWeek: number;
  currentWeek: number; // how many posted this week
}

export interface Strategy {
  id: string;
  identityId: string;
  contentPillars: ContentPillar[];
  cadence: CadenceTarget[];
  autoReplyEnabled: boolean;
  updatedAt: Date;
}

export interface PlaybookTask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  platform?: string;
}

export interface Playbook {
  id: string;
  identityId: string;
  title: string;
  description: string;
  tasks: PlaybookTask[];
  startDate: Date;
  endDate: Date;
  active: boolean;
}

// ============================================================================
// Brain
// ============================================================================

export interface ChatSession {
  id: string;
  identityId: string;
  title: string;
  pinned: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  messageCount: number;
}

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ActionButton {
  label: string;
  action: string; // e.g. 'add_to_flow', 'update_strategy', 'update_goal'
  variant: 'default' | 'outline' | 'ghost';
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  actionButtons?: ActionButton[];
  createdAt: Date;
}

// ============================================================================
// Flow
// ============================================================================

export enum FlowItemType {
  Trending = 'trending',
  DailyPost = 'daily_post',
  ReplyNeeded = 'reply_needed',
  Repost = 'repost',
  Outreach = 'outreach',
  MonitorAlert = 'monitor_alert',
}

export interface PostVersion {
  id: string;
  version: number;
  content: string;
  brandMatchScore: number; // 0-100
  predictedEngagement: number; // 0-100
  createdAt: Date;
}

export interface LearningNote {
  note: string;
  confirmed: boolean | null; // null = not yet responded, true = "remember this", false = "one-time"
}

export interface FlowItem {
  id: string;
  identityId: string;
  type: FlowItemType;
  priority: number; // 1 = highest
  title: string;
  summary: string;
  platform: string;
  content: string;
  versions: PostVersion[];
  learningNote?: LearningNote;
  sourceUrl?: string;
  createdAt: Date;
  expiresAt?: Date; // for trending items
  actions: ('approve' | 'reply' | 'send' | 'repost' | 'chat' | 'skip')[];
}

// ============================================================================
// Calendar
// ============================================================================

export type PostStatus = 'published' | 'scheduled' | 'draft';

export interface ScheduledPost {
  id: string;
  identityId: string;
  platform: string;
  content: string;
  status: PostStatus;
  scheduledAt: Date;
  publishedAt?: Date;
  performance?: {
    impressions: number;
    engagement: number;
    clicks: number;
  };
  author?: string;
}

export interface CalendarSlot {
  date: Date;
  posts: ScheduledPost[];
}

// ============================================================================
// Monitor
// ============================================================================

export type MonitorPlatform = 'reddit' | 'twitter' | 'linkedin' | 'producthunt';

export interface MonitorConfig {
  id: string;
  identityId: string;
  platform: MonitorPlatform;
  name: string;
  keywords: string[];
  subreddits?: string[];
  accounts?: string[];
  enabled: boolean;
  matchCount7d: number;
  lastChecked: Date;
}

export enum AlertSeverity {
  Critical = 'critical',
  Warning = 'warning',
  Info = 'info',
}

export interface MonitorAlert {
  id: string;
  monitorId: string;
  severity: AlertSeverity;
  title: string;
  summary: string;
  sourceUrl: string;
  platform: string;
  pushedToFlow: boolean;
  createdAt: Date;
}

export type FeedItemTag = 'match' | 'mention' | 'info' | 'alert';

export interface MonitorFeedItem {
  id: string;
  monitorId: string;
  tag: FeedItemTag;
  platform: string;
  author: string;
  content: string;
  sourceUrl: string;
  relevanceScore: number; // 0-100
  createdAt: Date;
  dismissed: boolean;
}

export interface ReplyTrackerItem {
  id: string;
  identityId: string;
  postTitle: string;
  platform: string;
  postUrl: string;
  newReplies: number;
  lastChecked: Date;
  autoCheck: boolean;
}

// ============================================================================
// Pulse
// ============================================================================

export interface StrategyHealth {
  contentQuality: number; // 0-100
  consistency: number;
  engagementTrend: number;
  brandVoiceMatch: number;
  audienceGrowth: number;
  overall: number;
}

export interface GoalProgress {
  goalId: string;
  title: string;
  target: number;
  current: number;
  progress: number;
  pace: GoalPace;
  trend: number[]; // last 7 data points
  unit: string;
}

export type InsightType = 'opportunity' | 'warning' | 'learning' | 'milestone';

export interface AIInsight {
  id: string;
  type: InsightType;
  finding: string;
  suggestion: string;
  metric?: string;
  createdAt: Date;
}

export interface TopContent {
  id: string;
  platform: string;
  content: string;
  impressions: number;
  engagement: number;
  publishedAt: Date;
  aiAnalysis: string;
}

export interface PlatformStats {
  platform: string;
  followers: number;
  followersChange: number;
  impressions: number;
  impressionsChange: number;
  engagement: number;
  engagementChange: number;
  posts: number;
}

export interface PerformanceData {
  date: string;
  impressions: number;
  engagement: number;
  followers: number;
}

export interface AILearningProgress {
  brandVoiceAccuracy: number; // 0-100
  brandVoiceAccuracyTrend: number[]; // weekly data
  oneTapApproveRate: number; // 0-100
  oneTapApproveRateTrend: number[];
  learnedThisWeek: string[];
}

// ============================================================================
// Settings
// ============================================================================

export interface AutoReplyRule {
  id: string;
  identityId: string;
  platform: string;
  enabled: boolean;
  triggerKeywords: string[];
  tone: 'friendly' | 'professional' | 'casual';
  maxPerDay: number;
}

export interface NotificationPreference {
  type: string;
  label: string;
  inApp: boolean;
  push: boolean;
  email: boolean;
}

// ============================================================================
// Team
// ============================================================================

export enum TeamRole {
  Owner = 'owner',
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: TeamRole;
  joinedAt: Date;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  postId: string;
  requestedBy: string;
  reviewedBy?: string;
  status: ApprovalStatus;
  brandMatchScore: number;
  content: string;
  platform: string;
  createdAt: Date;
  reviewedAt?: Date;
}

// ============================================================================
// AI Architecture (SPEC-SUPPLEMENT Part 5)
// ============================================================================

export interface EpisodicMemoryEntry {
  id: string;
  identityId: string;
  contentId: string;
  aiDraftV1: string;
  userFeedback?: string;
  finalVersion: string;
  editsSummary: string;
  learningNote?: string;
  performance?: {
    impressions: number;
    engagement: number;
    clicks: number;
  };
  createdAt: Date;
}

export type PatternSignal = 'positive' | 'negative';

export interface LearnedPattern {
  id: string;
  identityId: string;
  pattern: string;
  confidence: number; // 0-100
  evidenceCount: number;
  signal: PatternSignal;
  performanceMultiplier: number;
  createdAt: Date;
  lastSeen: Date;
}
