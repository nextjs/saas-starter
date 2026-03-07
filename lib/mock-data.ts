import type {
  Identity,
  Goal,
  Strategy,
  Playbook,
  ChatSession,
  ChatMessage,
  FlowItem,
  ScheduledPost,
  CalendarSlot,
  MonitorConfig,
  MonitorAlert,
  MonitorFeedItem,
  ReplyTrackerItem,
  StrategyHealth,
  GoalProgress,
  AIInsight,
  TopContent,
  PlatformStats,
  PerformanceData,
  AILearningProgress,
  LearnedPattern,
  AutoReplyRule,
  NotificationPreference,
  CadenceTarget,
  TeamMember,
} from './types';
import {
  FlowItemType,
  AlertSeverity,
  TeamRole,
} from './types';

// ============================================================================
// Helpers
// ============================================================================

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursFromNow(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d;
}

function todayAt(hours: number, minutes = 0): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ============================================================================
// Identities
// ============================================================================

export const identities: Identity[] = [
  {
    id: 'id-lekro',
    name: 'Alex K.',
    handle: '@lekro',
    avatar: '/avatars/lekro.jpg',
    type: 'personal',
    platforms: ['twitter', 'linkedin', 'reddit'],
    brandVoice: {
      voiceParams: {
        formality: 30,
        technicality: 75,
        humor: 45,
        assertiveness: 60,
        emojiUsage: 15,
      },
      contentPillars: [
        { id: 'cp-1', name: 'AI Agents', description: 'Building and shipping AI agent products', allocation: 35, color: '#6366f1' },
        { id: 'cp-2', name: 'Startup Building', description: 'Lessons from building in public', allocation: 25, color: '#f59e0b' },
        { id: 'cp-3', name: 'Payment Infra', description: 'Fintech and payment API insights', allocation: 25, color: '#10b981' },
        { id: 'cp-4', name: 'Dev Tools', description: 'Developer experience and tooling', allocation: 15, color: '#ec4899' },
      ],
      preferredFormats: [
        { format: 'short_post', weight: 0.4 },
        { format: 'thread', weight: 0.3 },
        { format: 'reply', weight: 0.2 },
        { format: 'long_form', weight: 0.1 },
      ],
      rules: [
        'Never use corporate jargon like "synergy" or "leverage"',
        'Use concrete examples over abstract claims',
        'End threads with a question to spark discussion',
      ],
      anchors: [
        'shipped this over the weekend',
        'here\'s what actually happened',
        'hot take:',
        'the thing nobody tells you about',
      ],
    },
    createdAt: daysAgo(90),
  },
  {
    id: 'id-deely',
    name: 'Deely',
    handle: '@deely_ai',
    avatar: '/avatars/deely.jpg',
    type: 'company',
    platforms: ['twitter', 'linkedin', 'producthunt', 'reddit'],
    brandVoice: {
      voiceParams: {
        formality: 50,
        technicality: 60,
        humor: 30,
        assertiveness: 55,
        emojiUsage: 25,
      },
      contentPillars: [
        { id: 'cp-5', name: 'Product Updates', description: 'New features, launches, and improvements', allocation: 30, color: '#6366f1' },
        { id: 'cp-6', name: 'Social Media Strategy', description: 'Tips for growing a social presence with AI', allocation: 30, color: '#f59e0b' },
        { id: 'cp-7', name: 'AI in Marketing', description: 'How AI transforms content creation', allocation: 25, color: '#10b981' },
        { id: 'cp-8', name: 'Community', description: 'User stories and community engagement', allocation: 15, color: '#ec4899' },
      ],
      preferredFormats: [
        { format: 'short_post', weight: 0.35 },
        { format: 'thread', weight: 0.25 },
        { format: 'long_form', weight: 0.25 },
        { format: 'reply', weight: 0.15 },
      ],
      rules: [
        'Always be helpful, never salesy',
        'Show, don\'t tell - use screenshots and demos',
        'Credit the community when sharing user stories',
      ],
      anchors: [
        'we just shipped',
        'here\'s how one creator',
        'your AI social strategist',
      ],
    },
    createdAt: daysAgo(60),
  },
];

// ============================================================================
// Goals
// ============================================================================

export const goals: Goal[] = [
  {
    id: 'goal-1',
    identityId: 'id-lekro',
    title: 'Grow Twitter to 5K followers',
    type: 'follower_growth',
    target: 5000,
    current: 3420,
    progress: 68,
    pace: 'on_track',
    unit: 'followers',
    platform: 'twitter',
    deadline: daysFromNow(45),
    createdAt: daysAgo(30),
  },
  {
    id: 'goal-2',
    identityId: 'id-lekro',
    title: 'Hit 4% engagement rate on LinkedIn',
    type: 'engagement_rate',
    target: 4.0,
    current: 2.8,
    progress: 70,
    pace: 'behind',
    unit: '%',
    platform: 'linkedin',
    deadline: daysFromNow(30),
    createdAt: daysAgo(30),
  },
  {
    id: 'goal-3',
    identityId: 'id-deely',
    title: 'Post 5x/week across all platforms',
    type: 'posting_frequency',
    target: 5,
    current: 6,
    progress: 100,
    pace: 'ahead',
    unit: 'posts/week',
    deadline: daysFromNow(60),
    createdAt: daysAgo(14),
  },
];

// ============================================================================
// Strategy
// ============================================================================

export const cadenceTargets: CadenceTarget[] = [
  { platform: 'twitter', postsPerWeek: 5, currentWeek: 3 },
  { platform: 'linkedin', postsPerWeek: 3, currentWeek: 2 },
  { platform: 'reddit', postsPerWeek: 2, currentWeek: 1 },
];

export const strategy: Strategy = {
  id: 'strat-1',
  identityId: 'id-lekro',
  contentPillars: identities[0].brandVoice.contentPillars,
  cadence: cadenceTargets,
  autoReplyEnabled: true,
  updatedAt: daysAgo(2),
};

export const playbook: Playbook = {
  id: 'pb-1',
  identityId: 'id-deely',
  title: 'Product Hunt Launch',
  description: 'Coordinate the Deely PH launch with pre-launch buzz, launch day content, and follow-up.',
  tasks: [
    { id: 'pbt-1', title: 'Write PH tagline + description', description: 'Craft the one-liner and 300-word description', dueDate: daysFromNow(5), completed: true, platform: 'producthunt' },
    { id: 'pbt-2', title: 'Prepare maker\'s first comment', description: 'Write the founder story comment for PH', dueDate: daysFromNow(7), completed: true, platform: 'producthunt' },
    { id: 'pbt-3', title: 'Schedule teaser tweets', description: '3 countdown tweets for launch week', dueDate: daysFromNow(10), completed: false, platform: 'twitter' },
    { id: 'pbt-4', title: 'LinkedIn launch announcement', description: 'Long-form post about why we built Deely', dueDate: daysFromNow(14), completed: false, platform: 'linkedin' },
    { id: 'pbt-5', title: 'Reddit r/SaaS launch post', description: 'Write a genuine build-in-public post', dueDate: daysFromNow(14), completed: false, platform: 'reddit' },
  ],
  startDate: daysAgo(3),
  endDate: daysFromNow(14),
  active: true,
};

// ============================================================================
// Brain - Chat Sessions & Messages
// ============================================================================

export const chatSessions: ChatSession[] = [
  {
    id: 'cs-1',
    identityId: 'id-lekro',
    title: 'Brand Setup',
    pinned: true,
    lastMessageAt: daysAgo(5),
    createdAt: daysAgo(90),
    messageCount: 24,
  },
  {
    id: 'cs-2',
    identityId: 'id-lekro',
    title: 'PH Launch Strategy',
    pinned: false,
    lastMessageAt: daysAgo(1),
    createdAt: daysAgo(7),
    messageCount: 18,
  },
  {
    id: 'cs-3',
    identityId: 'id-lekro',
    title: 'Content Pivot: AI Agents Focus',
    pinned: false,
    lastMessageAt: daysAgo(0),
    createdAt: daysAgo(3),
    messageCount: 12,
  },
  {
    id: 'cs-4',
    identityId: 'id-lekro',
    title: 'Weekly Strategy Review',
    pinned: false,
    lastMessageAt: daysAgo(2),
    createdAt: daysAgo(2),
    messageCount: 8,
  },
  {
    id: 'cs-5',
    identityId: 'id-deely',
    title: 'Deely Brand Voice Setup',
    pinned: true,
    lastMessageAt: daysAgo(10),
    createdAt: daysAgo(60),
    messageCount: 15,
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: 'cm-1',
    sessionId: 'cs-3',
    role: 'user',
    content: 'I want to shift my content focus more toward AI agents. The payment infra stuff still matters but AI agents is where the momentum is.',
    createdAt: daysAgo(3),
  },
  {
    id: 'cm-2',
    sessionId: 'cs-3',
    role: 'assistant',
    content: 'Makes sense - your AI agent posts have been getting 2.3x more engagement than payment content over the last 2 weeks. I\'d suggest shifting to 40% AI Agents, 20% Startup Building, 20% Payment Infra, 20% Dev Tools. Want me to update your content pillars?',
    actionButtons: [
      { label: 'Update Pillars', action: 'update_strategy', variant: 'default' },
      { label: 'Show me the data', action: 'show_analytics', variant: 'outline' },
    ],
    createdAt: daysAgo(3),
  },
  {
    id: 'cm-3',
    sessionId: 'cs-3',
    role: 'user',
    content: 'Yeah update it. Also, I saw that OpenAI just released their Agents SDK. Can you draft a hot take thread?',
    createdAt: daysAgo(3),
  },
  {
    id: 'cm-4',
    sessionId: 'cs-3',
    role: 'assistant',
    content: 'Done - pillars updated. Here\'s a draft thread on the OpenAI Agents SDK:\n\n1/ OpenAI just dropped their Agents SDK and it\'s... surprisingly minimal. Here\'s what they got right and what\'s missing.\n\n2/ What they got right: the handoff pattern. Being able to pass context between specialized agents is exactly how production systems work. No more god-prompt.\n\n3/ What\'s missing: memory. Real agent systems need to learn from past interactions. An SDK without episodic memory is a toy.\n\n4/ The bigger picture: we\'re in the "Rails vs Sinatra" phase of agent frameworks. Everyone\'s building one, but the winner will be whoever makes the agent-human handoff seamless.\n\n5/ What are you building with agent frameworks? Curious what use cases people are actually shipping.',
    actionButtons: [
      { label: 'Add to Flow', action: 'add_to_flow', variant: 'default' },
      { label: 'Edit in Post Chat', action: 'open_post_chat', variant: 'outline' },
    ],
    createdAt: daysAgo(3),
  },
  {
    id: 'cm-5',
    sessionId: 'cs-3',
    role: 'user',
    content: 'Love it, add to flow. Also can you monitor r/LangChain and r/LocalLLaMA for agent-related discussions?',
    createdAt: daysAgo(2),
  },
  {
    id: 'cm-6',
    sessionId: 'cs-3',
    role: 'assistant',
    content: 'Thread added to Flow. I\'ve set up monitoring for:\n- r/LangChain: keywords "agent", "multi-agent", "tool use"\n- r/LocalLLaMA: keywords "agent framework", "function calling", "agentic"\n\nI\'ll push high-relevance matches to your Flow and flag any trending discussions.',
    actionButtons: [
      { label: 'View Monitors', action: 'open_monitor', variant: 'outline' },
    ],
    createdAt: daysAgo(2),
  },
  {
    id: 'cm-7',
    sessionId: 'cs-3',
    role: 'user',
    content: 'Perfect. What about my LinkedIn strategy? I feel like I should be posting more there.',
    createdAt: daysAgo(1),
  },
  {
    id: 'cm-8',
    sessionId: 'cs-3',
    role: 'assistant',
    content: 'Your LinkedIn engagement rate is at 2.8% - below your 4% goal. Two observations:\n\n1. You\'re posting 2x/week but your best-performing slot (Tuesday 9am) only gets used half the time\n2. Your LinkedIn audience responds best to "lessons learned" posts, not hot takes\n\nI\'d recommend: bump to 3x/week, lock in Tue/Thu 9am + one weekend post, and lean into the "here\'s what actually happened" format that works well for you.',
    actionButtons: [
      { label: 'Update Cadence', action: 'update_strategy', variant: 'default' },
      { label: 'See LinkedIn Analytics', action: 'show_analytics', variant: 'outline' },
    ],
    createdAt: daysAgo(1),
  },
  {
    id: 'cm-9',
    sessionId: 'cs-3',
    role: 'user',
    content: 'Good call. Update the cadence to 3x/week for LinkedIn.',
    createdAt: daysAgo(0),
  },
  {
    id: 'cm-10',
    sessionId: 'cs-3',
    role: 'assistant',
    content: 'Updated. LinkedIn cadence is now 3 posts/week. I\'ll generate drafts for your Tuesday and Thursday slots this week. You\'re also behind on your Reddit goal - want me to draft a post for r/SaaS about your PH launch prep?',
    actionButtons: [
      { label: 'Yes, draft it', action: 'generate_draft', variant: 'default' },
      { label: 'Not now', action: 'dismiss', variant: 'ghost' },
    ],
    createdAt: daysAgo(0),
  },
];

// ============================================================================
// Flow Items
// ============================================================================

export const flowItems: FlowItem[] = [
  {
    id: 'fi-1',
    identityId: 'id-lekro',
    type: FlowItemType.Trending,
    priority: 1,
    title: 'Trending: Claude 4.5 benchmarks just dropped',
    summary: 'Anthropic released Claude 4.5 with major coding improvements. Your audience cares about this.',
    platform: 'twitter',
    content: 'Claude 4.5 just dropped and the coding benchmarks are wild.\n\nSWE-bench: 72% (up from 49%)\nTerminal use: actually reliable now\n\nBut here\'s what matters for agent builders: the extended thinking mode means your agents can actually reason through multi-step problems without hallucinating tool calls.\n\nThis changes the build-vs-prompt tradeoff completely.',
    versions: [
      { id: 'pv-1', version: 1, content: 'Claude 4.5 just dropped and the coding benchmarks are wild.\n\nSWE-bench: 72% (up from 49%)\nTerminal use: actually reliable now\n\nBut here\'s what matters for agent builders: the extended thinking mode means your agents can actually reason through multi-step problems without hallucinating tool calls.\n\nThis changes the build-vs-prompt tradeoff completely.', brandMatchScore: 88, predictedEngagement: 76, createdAt: hoursFromNow(-1) },
      { id: 'pv-1b', version: 2, content: 'Claude 4.5 just dropped.\n\nThe headline: extended thinking mode means your agents can reason through multi-step problems without hallucinating tool calls.\n\nThis changes the build-vs-prompt tradeoff completely. If your agent framework still relies on single-shot prompting, you\'re already behind.', brandMatchScore: 91, predictedEngagement: 81, createdAt: hoursFromNow(-0.5) },
      { id: 'pv-1c', version: 3, content: 'The agent game just changed.\n\nClaude 4.5 dropped and the extended thinking mode means your agents can reason through multi-step problems without hallucinating tool calls.\n\nThis changes the build-vs-prompt tradeoff completely. If your agent framework still relies on single-shot prompting, you\'re already behind.\n\nWhat are you rebuilding first?', brandMatchScore: 93, predictedEngagement: 85, createdAt: hoursFromNow(-0.2) },
    ],
    learningNote: {
      note: 'You prefer short, punchy openings over listing benchmark numbers. Ending with a question drives more engagement.',
      confirmed: null,
    },
    sourceUrl: 'https://anthropic.com/news/claude-4-5',
    createdAt: hoursFromNow(-1),
    expiresAt: hoursFromNow(6),
    actions: ['approve', 'chat', 'skip'],
  },
  {
    id: 'fi-2',
    identityId: 'id-lekro',
    type: FlowItemType.DailyPost,
    priority: 4,
    title: 'Daily: Thread on agent memory architectures',
    summary: 'AI-generated thread based on your AI Agents content pillar.',
    platform: 'twitter',
    content: '1/ Everyone\'s building AI agents but nobody talks about memory.\n\nYour agent is only as good as what it remembers. Here\'s how to think about agent memory architecture:\n\n2/ There are 3 types of memory your agent needs:\n- Working memory (current task context)\n- Episodic memory (past interactions)\n- Semantic memory (learned patterns)\n\nMost frameworks only give you #1. That\'s why agents feel dumb.\n\n3/ The trick is separating storage from retrieval. Vector DBs are great for storage. But retrieval needs to be context-aware - what matters NOW, not just what\'s similar.',
    versions: [
      { id: 'pv-2', version: 1, content: '1/ Everyone\'s building AI agents...', brandMatchScore: 91, predictedEngagement: 68, createdAt: hoursFromNow(-2) },
    ],
    createdAt: hoursFromNow(-2),
    actions: ['approve', 'chat', 'skip'],
  },
  {
    id: 'fi-3',
    identityId: 'id-lekro',
    type: FlowItemType.ReplyNeeded,
    priority: 2,
    title: 'Reply: @pmarca mentioned your agent framework take',
    summary: 'Your thread on agent frameworks got quoted. 340 likes and counting.',
    platform: 'twitter',
    content: 'Thanks for the mention! The key insight is that agent frameworks need to optimize for the human-in-the-loop case, not the fully autonomous case. Most real production agents are semi-autonomous - they do 80% of the work and ask for help on the remaining 20%.',
    versions: [
      { id: 'pv-3', version: 1, content: 'Thanks for the mention!...', brandMatchScore: 85, predictedEngagement: 82, createdAt: hoursFromNow(-3) },
    ],
    sourceUrl: 'https://twitter.com/pmarca/status/123456',
    createdAt: hoursFromNow(-3),
    actions: ['reply', 'chat', 'skip'],
  },
  {
    id: 'fi-4',
    identityId: 'id-lekro',
    type: FlowItemType.DailyPost,
    priority: 4,
    title: 'Daily: LinkedIn post on startup metrics',
    summary: 'Professional post for your Startup Building pillar.',
    platform: 'linkedin',
    content: 'The metric that actually matters in the first year of a startup isn\'t revenue. It\'s not even growth.\n\nIt\'s the speed at which you can run experiments.\n\nWe went from 2-week experiment cycles to 3-day cycles by:\n1. Cutting scope ruthlessly (test the hypothesis, not the product)\n2. Using AI to generate test content in minutes instead of hours\n3. Measuring one metric per experiment, not five\n\nResult: we validated our positioning 4x faster than our previous startup.\n\nWhat\'s your experiment cadence?',
    versions: [
      { id: 'pv-4', version: 1, content: 'The metric that actually matters in the first year of a startup isn\'t revenue. It\'s not even growth.\n\nIt\'s the speed at which you can run experiments.\n\nWe went from 2-week experiment cycles to 3-day cycles by:\n1. Cutting scope ruthlessly (test the hypothesis, not the product)\n2. Using AI to generate test content in minutes instead of hours\n3. Measuring one metric per experiment, not five\n\nResult: we validated our positioning 4x faster than our previous startup.\n\nWhat\'s your experiment cadence?', brandMatchScore: 87, predictedEngagement: 72, createdAt: hoursFromNow(-2) },
      { id: 'pv-4b', version: 2, content: 'At my last startup, experiment cycles took 2 weeks. At Deely, we got it down to 3 days.\n\nThe playbook:\n1. Cut scope ruthlessly - test the hypothesis, not the product\n2. Use AI to generate test content in minutes, not hours\n3. One metric per experiment. Not five.\n\nResult: validated our positioning 4x faster.\n\nThe startup that learns fastest wins. What\'s your experiment cadence?', brandMatchScore: 92, predictedEngagement: 78, createdAt: hoursFromNow(-1.5) },
    ],
    learningNote: {
      note: 'On LinkedIn, leading with a personal anecdote ("at my last startup") outperforms abstract statements.',
      confirmed: null,
    },
    createdAt: hoursFromNow(-2),
    actions: ['approve', 'chat', 'skip'],
  },
  {
    id: 'fi-5',
    identityId: 'id-lekro',
    type: FlowItemType.Repost,
    priority: 6,
    title: 'Repost: Stripe launched Orchestration API',
    summary: 'Relevant to your Payment Infra pillar. Add a quote comment.',
    platform: 'twitter',
    content: 'The Stripe Orchestration API is the most under-hyped launch this quarter. Being able to route payments across multiple processors with a single integration changes the economics for any company doing >$1M in volume.',
    versions: [
      { id: 'pv-5', version: 1, content: 'The Stripe Orchestration API...', brandMatchScore: 83, predictedEngagement: 58, createdAt: hoursFromNow(-4) },
    ],
    sourceUrl: 'https://twitter.com/stripe/status/789012',
    createdAt: hoursFromNow(-4),
    actions: ['repost', 'chat', 'skip'],
  },
  {
    id: 'fi-6',
    identityId: 'id-lekro',
    type: FlowItemType.Outreach,
    priority: 5,
    title: 'Outreach: DM to @naval about AI agent collaboration',
    summary: 'Potential connection for your AI Agents content. High relevance match.',
    platform: 'twitter',
    content: 'Hey - loved your take on AI agents replacing SaaS. We\'re building Deely, an AI social strategist that learns your brand voice. Would love to show you what personalized AI content looks like vs generic. Happy to demo anytime.',
    versions: [
      { id: 'pv-6', version: 1, content: 'Hey - loved your take on AI agents...', brandMatchScore: 79, predictedEngagement: 45, createdAt: hoursFromNow(-5) },
    ],
    createdAt: hoursFromNow(-5),
    actions: ['send', 'chat', 'skip'],
  },
  {
    id: 'fi-7',
    identityId: 'id-lekro',
    type: FlowItemType.MonitorAlert,
    priority: 3,
    title: 'Alert: Someone asking about AI social tools on r/SaaS',
    summary: 'High-relevance Reddit thread. Great opportunity to mention Deely naturally.',
    platform: 'reddit',
    content: 'Great question! I\'ve been building in this space - the key challenge with AI social tools is maintaining a consistent brand voice across platforms. Most tools just do template-based posting. The next gen (what we\'re building at Deely) actually learns your writing style from your past content and gets better over time. Happy to share more about the approach if useful.',
    versions: [
      { id: 'pv-7', version: 1, content: 'Great question! I\'ve been building...', brandMatchScore: 82, predictedEngagement: 55, createdAt: hoursFromNow(-6) },
    ],
    sourceUrl: 'https://reddit.com/r/SaaS/comments/abc123',
    createdAt: hoursFromNow(-6),
    actions: ['reply', 'chat', 'skip'],
  },
  {
    id: 'fi-8',
    identityId: 'id-deely',
    type: FlowItemType.DailyPost,
    priority: 4,
    title: 'Daily: How AI learns your brand voice',
    summary: 'Educational post for the @deely_ai account.',
    platform: 'twitter',
    content: 'Your brand voice isn\'t a template. It\'s a living thing.\n\nThat\'s why Deely doesn\'t just use prompts - it builds a structured model of HOW you write:\n\n- Formality level\n- Technical depth\n- Humor style\n- Sentence patterns\n- Words you never use\n\nThe result? Content that sounds like you wrote it on your best day.',
    versions: [
      { id: 'pv-8', version: 1, content: 'Your brand voice isn\'t a template...', brandMatchScore: 93, predictedEngagement: 64, createdAt: hoursFromNow(-3) },
    ],
    createdAt: hoursFromNow(-3),
    actions: ['approve', 'chat', 'skip'],
  },
];

// ============================================================================
// Calendar
// ============================================================================

function buildCalendarWeek(): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const weekPosts: ScheduledPost[] = [
    // Monday - published
    {
      id: 'sp-1', identityId: 'id-lekro', platform: 'twitter',
      content: 'Shipped a new feature this weekend: AI-powered brand voice analysis. Feed it 20 of your best posts and it maps your writing DNA.',
      status: 'published', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 9, 0),
      publishedAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 9, 0),
      performance: { impressions: 4200, engagement: 187, clicks: 63 },
    },
    {
      id: 'sp-2', identityId: 'id-lekro', platform: 'linkedin',
      content: 'The hardest part of building an AI product isn\'t the AI. It\'s figuring out where the human should stay in the loop.',
      status: 'published', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 10, 0),
      publishedAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 10, 0),
      performance: { impressions: 2800, engagement: 124, clicks: 41 },
    },
    // Tuesday - published
    {
      id: 'sp-3', identityId: 'id-lekro', platform: 'twitter',
      content: 'Hot take: the best AI agent frameworks will look more like game engines than web frameworks. State machines, event systems, behavior trees.',
      status: 'published', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 1, 9, 0),
      publishedAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 1, 9, 2),
      performance: { impressions: 8900, engagement: 342, clicks: 128 },
    },
    // Wednesday - scheduled
    {
      id: 'sp-4', identityId: 'id-lekro', platform: 'twitter',
      content: 'Thread on agent memory architectures coming up...',
      status: 'scheduled', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 2, 9, 0),
    },
    {
      id: 'sp-5', identityId: 'id-lekro', platform: 'linkedin',
      content: 'The metric that actually matters in the first year of a startup isn\'t revenue...',
      status: 'scheduled', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 2, 10, 0),
    },
    // Thursday - scheduled
    {
      id: 'sp-6', identityId: 'id-lekro', platform: 'reddit',
      content: 'Build-in-public update: We just hit 500 beta users on Deely...',
      status: 'scheduled', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 3, 12, 0),
    },
    // Friday - draft
    {
      id: 'sp-7', identityId: 'id-lekro', platform: 'twitter',
      content: 'Why every startup should have an AI content strategy in 2026...',
      status: 'draft', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 4, 9, 0),
    },
    // Saturday - draft
    {
      id: 'sp-8', identityId: 'id-deely', platform: 'twitter',
      content: 'Weekend reading: 5 lessons from building an AI that learns your voice...',
      status: 'draft', scheduledAt: new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 5, 11, 0),
    },
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayPosts = weekPosts.filter(p => {
      const postDay = p.scheduledAt.getDate();
      return postDay === date.getDate();
    });
    slots.push({ date, posts: dayPosts });
  }

  return slots;
}

export const calendarSlots: CalendarSlot[] = buildCalendarWeek();

// ============================================================================
// Monitor
// ============================================================================

export const monitors: MonitorConfig[] = [
  {
    id: 'mon-1', identityId: 'id-lekro', platform: 'reddit',
    name: 'Reddit AI Agents',
    keywords: ['ai agent', 'agent framework', 'multi-agent', 'tool use', 'function calling'],
    subreddits: ['r/SaaS', 'r/LangChain', 'r/LocalLLaMA', 'r/artificial'],
    enabled: true, matchCount7d: 23, lastChecked: hoursFromNow(-1),
  },
  {
    id: 'mon-2', identityId: 'id-lekro', platform: 'twitter',
    name: 'Twitter Brand Mentions',
    keywords: ['deely', '@lekro', 'ai social strategist'],
    accounts: ['@competitor1', '@competitor2'],
    enabled: true, matchCount7d: 8, lastChecked: hoursFromNow(-0.5),
  },
  {
    id: 'mon-3', identityId: 'id-lekro', platform: 'linkedin',
    name: 'LinkedIn Mentions',
    keywords: ['deely', 'ai content creation', 'social media ai'],
    enabled: true, matchCount7d: 5, lastChecked: hoursFromNow(-2),
  },
  {
    id: 'mon-4', identityId: 'id-deely', platform: 'producthunt',
    name: 'Product Hunt Comments',
    keywords: ['deely', 'ai social', 'brand voice ai'],
    enabled: true, matchCount7d: 3, lastChecked: hoursFromNow(-3),
  },
];

export const monitorAlerts: MonitorAlert[] = [
  {
    id: 'ma-1', monitorId: 'mon-2', severity: AlertSeverity.Critical,
    title: 'Negative tweet about Deely going semi-viral',
    summary: '"tried @deely_ai and it just spits out generic linkedin garbage. waste of time." - 89 likes, 12 retweets. Recommend a measured response.',
    sourceUrl: 'https://twitter.com/user123/status/456789', platform: 'twitter',
    pushedToFlow: true, createdAt: hoursFromNow(-4),
  },
  {
    id: 'ma-2', monitorId: 'mon-1', severity: AlertSeverity.Warning,
    title: 'Competitor launched agent-based social tool',
    summary: 'ContentBot.ai just announced their "AI Agent for Social Media" feature on r/SaaS. 200+ upvotes. Their approach uses fine-tuning, not symbolic learning like ours.',
    sourceUrl: 'https://reddit.com/r/SaaS/comments/xyz789', platform: 'reddit',
    pushedToFlow: false, createdAt: hoursFromNow(-8),
  },
  {
    id: 'ma-3', monitorId: 'mon-3', severity: AlertSeverity.Info,
    title: 'Industry report mentions AI social tools category',
    summary: 'A16Z published "State of AI Marketing 2026" - mentions the AI social strategist category is growing 3x YoY. Good content opportunity.',
    sourceUrl: 'https://linkedin.com/posts/a16z/report', platform: 'linkedin',
    pushedToFlow: false, createdAt: daysAgo(1),
  },
];

export const monitorFeedItems: MonitorFeedItem[] = [
  {
    id: 'mf-1', monitorId: 'mon-1', tag: 'alert', platform: 'reddit',
    author: 'u/startup_grind', content: 'Has anyone tried Deely for social media management? Looks interesting but not sure if the AI actually learns your style or if it\'s just ChatGPT wrappers.',
    sourceUrl: 'https://reddit.com/r/SaaS/comments/thread1', relevanceScore: 95,
    createdAt: hoursFromNow(-2), dismissed: false,
  },
  {
    id: 'mf-2', monitorId: 'mon-1', tag: 'match', platform: 'reddit',
    author: 'u/ai_builder_42', content: 'Building a multi-agent system for content creation. The hardest part is maintaining consistent voice across agents. Anyone solved this?',
    sourceUrl: 'https://reddit.com/r/LangChain/comments/thread2', relevanceScore: 88,
    createdAt: hoursFromNow(-5), dismissed: false,
  },
  {
    id: 'mf-3', monitorId: 'mon-2', tag: 'mention', platform: 'twitter',
    author: '@indiehacker_maya', content: 'Just discovered @lekro\'s thread on agent memory architectures. This is exactly what I needed for my project. Bookmarked.',
    sourceUrl: 'https://twitter.com/indiehacker_maya/status/111', relevanceScore: 72,
    createdAt: hoursFromNow(-6), dismissed: false,
  },
  {
    id: 'mf-4', monitorId: 'mon-1', tag: 'match', platform: 'reddit',
    author: 'u/dev_tools_fan', content: 'Comparison: CrewAI vs AutoGen vs LangGraph for building production agent systems. Here\'s what I found after building with all three...',
    sourceUrl: 'https://reddit.com/r/LangChain/comments/thread3', relevanceScore: 76,
    createdAt: hoursFromNow(-8), dismissed: false,
  },
  {
    id: 'mf-5', monitorId: 'mon-3', tag: 'info', platform: 'linkedin',
    author: 'Sarah Chen', content: 'AI-powered content creation is entering its "personalization era." Generic AI content is dead. The winners will be tools that truly understand individual brand voices.',
    sourceUrl: 'https://linkedin.com/posts/sarah-chen/ai-content', relevanceScore: 81,
    createdAt: daysAgo(1), dismissed: false,
  },
  {
    id: 'mf-6', monitorId: 'mon-2', tag: 'mention', platform: 'twitter',
    author: '@devtools_weekly', content: 'This week\'s picks: Deely (AI social strategist), CodeCraft (AI pair programmer), DataBridge (real-time ETL). All built by solo founders.',
    sourceUrl: 'https://twitter.com/devtools_weekly/status/222', relevanceScore: 68,
    createdAt: daysAgo(1), dismissed: true,
  },
  {
    id: 'mf-7', monitorId: 'mon-4', tag: 'info', platform: 'producthunt',
    author: 'PH User', content: 'Looking for an AI tool that can manage my social media across LinkedIn, Twitter, and Reddit. Ideally something that learns my writing style.',
    sourceUrl: 'https://producthunt.com/discussions/thread4', relevanceScore: 90,
    createdAt: daysAgo(2), dismissed: false,
  },
  {
    id: 'mf-8', monitorId: 'mon-1', tag: 'match', platform: 'reddit',
    author: 'u/payment_nerd', content: 'Best practices for building payment agent systems? I want an AI that can handle payment routing decisions based on historical success rates.',
    sourceUrl: 'https://reddit.com/r/SaaS/comments/thread5', relevanceScore: 65,
    createdAt: daysAgo(2), dismissed: false,
  },
];

export const replyTrackerItems: ReplyTrackerItem[] = [
  {
    id: 'rt-1', identityId: 'id-lekro', postTitle: 'Thread: Agent memory architectures',
    platform: 'twitter', postUrl: 'https://twitter.com/lekro/status/thread1',
    newReplies: 7, lastChecked: hoursFromNow(-1), autoCheck: true,
  },
  {
    id: 'rt-2', identityId: 'id-lekro', postTitle: 'AI agent frameworks hot take',
    platform: 'twitter', postUrl: 'https://twitter.com/lekro/status/thread2',
    newReplies: 3, lastChecked: hoursFromNow(-2), autoCheck: true,
  },
  {
    id: 'rt-3', identityId: 'id-lekro', postTitle: 'Build in public update: 500 beta users',
    platform: 'reddit', postUrl: 'https://reddit.com/r/SaaS/comments/bip500',
    newReplies: 12, lastChecked: hoursFromNow(-4), autoCheck: true,
  },
];

// ============================================================================
// Pulse
// ============================================================================

export const strategyHealth: StrategyHealth = {
  contentQuality: 82,
  consistency: 71,
  engagementTrend: 88,
  brandVoiceMatch: 85,
  audienceGrowth: 76,
  overall: 80,
};

export const goalProgressData: GoalProgress[] = [
  {
    goalId: 'goal-1', title: 'Twitter 5K followers',
    target: 5000, current: 3420, progress: 68, pace: 'on_track',
    trend: [3180, 3220, 3260, 3310, 3350, 3390, 3420], unit: 'followers',
  },
  {
    goalId: 'goal-2', title: 'LinkedIn 4% engagement',
    target: 4.0, current: 2.8, progress: 70, pace: 'behind',
    trend: [2.4, 2.5, 2.5, 2.6, 2.7, 2.7, 2.8], unit: '%',
  },
  {
    goalId: 'goal-3', title: 'Post 5x/week',
    target: 5, current: 6, progress: 100, pace: 'ahead',
    trend: [4, 3, 5, 5, 4, 6, 6], unit: 'posts/week',
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: 'ins-1', type: 'opportunity',
    finding: 'Your AI agent content gets 2.3x more engagement than payment content',
    suggestion: 'Consider shifting 10% allocation from Payment Infra to AI Agents pillar',
    metric: '+2.3x engagement', createdAt: daysAgo(1),
  },
  {
    id: 'ins-2', type: 'warning',
    finding: 'LinkedIn engagement rate dropped 15% this week',
    suggestion: 'Your last 3 LinkedIn posts were published outside optimal hours. Try Tue/Thu 9am slots',
    metric: '-15% engagement', createdAt: daysAgo(1),
  },
  {
    id: 'ins-3', type: 'learning',
    finding: 'Threads ending with a question get 40% more replies',
    suggestion: 'I\'ll add a discussion question to all future thread drafts',
    metric: '+40% replies', createdAt: daysAgo(2),
  },
  {
    id: 'ins-4', type: 'milestone',
    finding: 'You\'ve crossed 3,400 Twitter followers',
    suggestion: 'At current pace, you\'ll hit 5K in ~6 weeks. Consider a viral thread to accelerate',
    metric: '3,420 followers', createdAt: daysAgo(3),
  },
];

export const topContent: TopContent[] = [
  {
    id: 'tc-1', platform: 'twitter',
    content: 'Hot take: the best AI agent frameworks will look more like game engines than web frameworks. State machines, event systems, behavior trees.',
    impressions: 8900, engagement: 342, publishedAt: daysAgo(2),
    aiAnalysis: 'Contrarian framing ("hot take") combined with a concrete analogy (game engines) drove high engagement. The comparison was unexpected enough to spark debate.',
  },
  {
    id: 'tc-2', platform: 'twitter',
    content: 'Shipped a new feature this weekend: AI-powered brand voice analysis. Feed it 20 of your best posts and it maps your writing DNA.',
    impressions: 4200, engagement: 187, publishedAt: daysAgo(5),
    aiAnalysis: 'Build-in-public updates with concrete numbers perform well. "20 posts" and "writing DNA" gave it a hook.',
  },
  {
    id: 'tc-3', platform: 'linkedin',
    content: 'The hardest part of building an AI product isn\'t the AI. It\'s figuring out where the human should stay in the loop.',
    impressions: 2800, engagement: 124, publishedAt: daysAgo(5),
    aiAnalysis: 'The contrarian opening ("isn\'t the AI") resonated with the LinkedIn audience. Short, punchy format worked better than long-form here.',
  },
];

export const worstContent: TopContent[] = [
  {
    id: 'wc-1', platform: 'linkedin',
    content: 'Excited to announce that we\'re working on some amazing new features for Deely! Stay tuned for updates. #AI #SocialMedia #Startup',
    impressions: 340, engagement: 8, publishedAt: daysAgo(8),
    aiAnalysis: 'Vague announcement with no substance. Hashtag spam. Breaks your rule of "show, don\'t tell." This is the type of generic content your audience doesn\'t engage with.',
  },
];

export const platformStats: PlatformStats[] = [
  {
    platform: 'twitter', followers: 3420, followersChange: 12.3,
    impressions: 28400, impressionsChange: 18.5,
    engagement: 1240, engagementChange: 22.1, posts: 12,
  },
  {
    platform: 'linkedin', followers: 1850, followersChange: 5.2,
    impressions: 8200, impressionsChange: -8.3,
    engagement: 412, engagementChange: -15.0, posts: 5,
  },
  {
    platform: 'reddit', followers: 890, followersChange: 28.5,
    impressions: 12600, impressionsChange: 45.2,
    engagement: 567, engagementChange: 38.0, posts: 3,
  },
];

export const performanceData: PerformanceData[] = [
  { date: '2026-02-28', impressions: 3200, engagement: 142, followers: 3180 },
  { date: '2026-03-01', impressions: 4100, engagement: 178, followers: 3220 },
  { date: '2026-03-02', impressions: 3800, engagement: 165, followers: 3260 },
  { date: '2026-03-03', impressions: 5200, engagement: 234, followers: 3310 },
  { date: '2026-03-04', impressions: 9800, engagement: 412, followers: 3350 },
  { date: '2026-03-05', impressions: 6400, engagement: 287, followers: 3390 },
  { date: '2026-03-06', impressions: 4800, engagement: 198, followers: 3420 },
];

export const aiLearningProgress: AILearningProgress = {
  brandVoiceAccuracy: 85,
  brandVoiceAccuracyTrend: [62, 68, 72, 76, 79, 82, 85],
  oneTapApproveRate: 42,
  oneTapApproveRateTrend: [18, 22, 28, 31, 35, 38, 42],
  learnedThisWeek: [
    'You prefer short punchy sentences over long compound ones',
    'Threads that end with a question get more replies from your audience',
    'Your LinkedIn audience responds better to "lesson learned" framing than hot takes',
    'Avoid hashtags on Twitter - your engagement drops 20% when using them',
  ],
};

// ============================================================================
// AI Architecture - Learned Patterns
// ============================================================================

export const learnedPatterns: LearnedPattern[] = [
  {
    id: 'lp-1', identityId: 'id-lekro',
    pattern: 'Contrarian opening ("hot take:", "unpopular opinion:") drives 2x more engagement on Twitter',
    confidence: 87, evidenceCount: 14, signal: 'positive', performanceMultiplier: 2.1,
    createdAt: daysAgo(30), lastSeen: daysAgo(2),
  },
  {
    id: 'lp-2', identityId: 'id-lekro',
    pattern: 'Threads ending with a discussion question get 40% more replies',
    confidence: 82, evidenceCount: 9, signal: 'positive', performanceMultiplier: 1.4,
    createdAt: daysAgo(21), lastSeen: daysAgo(1),
  },
  {
    id: 'lp-3', identityId: 'id-lekro',
    pattern: 'Using hashtags on Twitter reduces engagement by ~20%',
    confidence: 74, evidenceCount: 6, signal: 'negative', performanceMultiplier: 0.8,
    createdAt: daysAgo(14), lastSeen: daysAgo(5),
  },
];

// ============================================================================
// Settings
// ============================================================================

export const autoReplyRules: AutoReplyRule[] = [
  {
    id: 'ar-1', identityId: 'id-lekro', platform: 'twitter',
    enabled: true, triggerKeywords: ['thanks', 'great thread', 'love this'],
    tone: 'casual', maxPerDay: 10,
  },
  {
    id: 'ar-2', identityId: 'id-lekro', platform: 'linkedin',
    enabled: false, triggerKeywords: ['interesting', 'agree', 'great point'],
    tone: 'professional', maxPerDay: 5,
  },
];

export const notificationPreferences: NotificationPreference[] = [
  { type: 'post_published', label: 'Post published', inApp: true, push: false, email: false },
  { type: 'performance_milestone', label: 'Performance milestone', inApp: true, push: true, email: false },
  { type: 'mention_reply', label: 'Mention / reply needed', inApp: true, push: true, email: false },
  { type: 'monitor_alert', label: 'Monitor alert', inApp: true, push: true, email: true },
  { type: 'strategy_suggestion', label: 'Brain strategy suggestion', inApp: true, push: false, email: false },
  { type: 'approval_request', label: 'Team approval request', inApp: true, push: true, email: true },
  { type: 'daily_flow', label: 'Daily Flow ready', inApp: true, push: true, email: false },
  { type: 'weekly_summary', label: 'Weekly summary', inApp: true, push: false, email: true },
  { type: 'goal_behind', label: 'Goal behind pace', inApp: true, push: true, email: true },
];

// ============================================================================
// Team
// ============================================================================

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-1', userId: 'u-1', name: 'Alex K.', email: 'alex@deely.ai',
    avatar: '/avatars/lekro.jpg', role: TeamRole.Owner, joinedAt: daysAgo(90),
  },
  {
    id: 'tm-2', userId: 'u-2', name: 'Jordan Lee', email: 'jordan@deely.ai',
    avatar: '/avatars/jordan.jpg', role: TeamRole.Editor, joinedAt: daysAgo(30),
  },
  {
    id: 'tm-3', userId: 'u-3', name: 'Sam Rivera', email: 'sam@deely.ai',
    avatar: '/avatars/sam.jpg', role: TeamRole.Viewer, joinedAt: daysAgo(14),
  },
];

// ============================================================================
// Current state
// ============================================================================

export const currentIdentityId = 'id-lekro';
export const activeSessionId = 'cs-3';
