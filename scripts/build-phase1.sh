#!/bin/bash
set -e

# ============================================================
# Deely Phase 1 MVP — Autonomous Build Script
# 每一步是一个独立的 claude -p 调用
# 顺序执行，每步完成后才进入下一步
# ============================================================

cd /Users/lekro/deely
LOGDIR="logs"
MAXTURNS=50
FLAGS="--dangerously-skip-permissions --max-turns $MAXTURNS"

timestamp() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(timestamp)] $1" | tee -a "$LOGDIR/build.log"; }

log "========================================="
log "Deely Phase 1 Build — Starting"
log "========================================="

# ─────────────────────────────────────────────
# Step 0: Install dependencies
# ─────────────────────────────────────────────
log "Step 0: Installing dependencies..."
pnpm install 2>&1 | tee "$LOGDIR/step0-install.log"
log "Step 0: Done"

# ─────────────────────────────────────────────
# Step 1: App Shell — Sidebar + Route Scaffolding
# ─────────────────────────────────────────────
log "Step 1: App Shell — Starting"
claude -p "
Read docs/SPEC.md and CLAUDE.md for full context. This is Deely — a social media strategy platform.

TASK: Build the app shell with sidebar navigation and page route scaffolding.

IMPORTANT DESIGN REQUIREMENTS:
- Use the /ui-ux-pro-max skill approach: clean, minimal, neutral aesthetic
- Sidebar: dark or neutral background, icons with labels, active state highlight
- Icons: Lucide with strokeWidth={1.75}, h-4 w-4 in sidebar
- Mobile: collapsible sidebar using PanelLeft/PanelLeftClose icons, sticky header
- Use cn() from lib/utils for conditional classes, never string concat

IMPLEMENTATION:

1. Install needed shadcn components first:
   pnpm dlx shadcn@latest add tooltip sheet separator

2. Create app/(dashboard)/layout.tsx — new layout with:
   - Left sidebar (w-60 desktop, sheet on mobile) with 6 nav items:
     Brain (Brain icon), Flow (Zap), Calendar (Calendar), Monitor (Eye), Pulse (BarChart3), Settings (Settings)
   - Active route highlighting (use usePathname)
   - User avatar dropdown at sidebar bottom (keep existing UserMenu logic)
   - Smooth transitions

3. Create an Identity Switcher component at sidebar top (from SPEC-SUPPLEMENT Part 2):
   - Show current identity avatar + name
   - Dropdown to switch (use mock data for now)
   - + Add Identity button

4. Create route pages (each just a placeholder with page name + icon for now):
   - app/(dashboard)/brain/page.tsx
   - app/(dashboard)/flow/page.tsx
   - app/(dashboard)/calendar/page.tsx
   - app/(dashboard)/monitor/page.tsx
   - app/(dashboard)/pulse/page.tsx
   - app/(dashboard)/settings/page.tsx

5. Update app/(dashboard)/page.tsx to redirect to /brain

6. Remove the old terminal.tsx and landing page content that came with the SaaS starter

After implementing, run: pnpm build
If build fails, fix errors and rebuild.
" $FLAGS 2>&1 | tee "$LOGDIR/step1-shell.log"
log "Step 1: Done"

# ─────────────────────────────────────────────
# Step 2: Mock Data Layer + Type Definitions
# ─────────────────────────────────────────────
log "Step 2: Mock Data — Starting"
claude -p "
Read docs/SPEC.md and docs/SPEC-SUPPLEMENT.md for full context.

TASK: Create the complete mock data layer and TypeScript type definitions for Deely.

This is the foundation that ALL pages will use. Get the types right.

1. Create lib/types.ts with ALL types needed across the app:

   // Identity / Multi-brand
   Identity, BrandVoiceProfile, VoiceParams, ContentPillar

   // Goals & Strategy
   Goal (with progress, pace, deadline), Strategy, Playbook, PlaybookTask

   // Brain
   ChatSession, ChatMessage, ActionButton

   // Flow
   FlowItem (union type for: trending, daily_post, reply_needed, repost, outreach, monitor_alert)
   FlowItemType enum
   PostVersion, LearningNote

   // Calendar
   ScheduledPost, CalendarSlot, CadenceTarget

   // Monitor
   MonitorConfig, MonitorAlert, MonitorFeedItem, ReplyTrackerItem
   AlertSeverity enum (critical, warning, info)

   // Pulse
   StrategyHealth, GoalProgress, AIInsight, TopContent, AILearningProgress
   PlatformStats, PerformanceData

   // Settings
   AutoReplyRule, NotificationPreference

   // Team
   TeamMember, TeamRole enum (owner, admin, editor, viewer)
   ApprovalRequest

   // AI Architecture (from SPEC-SUPPLEMENT Part 5)
   EpisodicMemoryEntry, LearnedPattern

2. Create lib/mock-data.ts with realistic mock data covering:
   - 2 identities (personal @lekro + company @deely_ai)
   - 3 goals with varying progress/pace
   - Strategy with 4 content pillars
   - 5 chat sessions (1 pinned 'Brand Setup')
   - 10 chat messages in the active session
   - 8 flow items covering all 6 types
   - 7 days of calendar data (mix of published/scheduled/draft)
   - 4 active monitors (Reddit, Twitter, LinkedIn, PH)
   - 3 alerts + 8 feed items
   - Pulse data: strategy health scores, 4 insights, top/worst content, learning progress with weekly trend
   - 3 learned patterns

   Make the mock data feel real — use actual social media content examples about AI agents, payment infra, startup building.

3. Create lib/mock-data-helpers.ts with utility functions:
   - getFlowItems(filter?: FlowItemType): FlowItem[]
   - getCalendarSlots(weekStart: Date): CalendarSlot[]
   - getMonitorFeed(filter?: string): MonitorFeedItem[]
   - getCurrentIdentity(): Identity
   - etc.

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step2-mockdata.log"
log "Step 2: Done"

# ─────────────────────────────────────────────
# Step 3: Brain Page — Strategy Panel (Left)
# ─────────────────────────────────────────────
log "Step 3: Brain Strategy Panel — Starting"
claude -p "
Read docs/SPEC.md section 'Brain' for the full spec. Read lib/types.ts and lib/mock-data.ts for data structures.

TASK: Build the Brain page LEFT SIDE — the Strategy Panel.

DESIGN REQUIREMENTS:
- This is a live dashboard panel, always visible on desktop
- Fixed width ~320px, full height, scrollable independently
- Clean card-based sections with subtle separators
- Progress bars: use colored fills (green=on track, yellow=behind, blue=ahead)
- Compact but readable information density
- Mobile: collapses into an expandable header/drawer

IMPLEMENTATION:

1. Create components/brain/strategy-panel.tsx:
   - Goals Section:
     * Each goal: title, progress bar (shadcn Progress), pace badge, deadline
     * Color coding: green=on track, yellow/amber=behind with ⚠️, blue=ahead
     * [Edit Goals] button (toggles inline edit mode with React state)
   - Strategy Section:
     * Content Pillars with percentage bars and labels
     * Platform Cadence: icon + frequency text for each platform (Twitter 2/day, LinkedIn 1/day, etc.)
     * Auto-reply status: small toggle with status text
     * Active Playbook card (if any): name, day X/Y progress, [View Plan] link

2. Create components/brain/goals-list.tsx — the goals subsection
3. Create components/brain/content-pillars.tsx — pillar bars
4. Create components/brain/playbook-card.tsx — active playbook mini card

5. Wire into app/(dashboard)/brain/page.tsx:
   - Two-column layout: left Strategy Panel (w-80) + right placeholder div
   - On mobile: Strategy Panel becomes a collapsible section at top

Install any needed shadcn components: pnpm dlx shadcn@latest add progress badge switch

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step3-brain-panel.log"
log "Step 3: Done"

# ─────────────────────────────────────────────
# Step 4: Brain Page — Chat (Right)
# ─────────────────────────────────────────────
log "Step 4: Brain Chat — Starting"
claude -p "
Read docs/SPEC.md section 'Brain' chat spec. Read lib/types.ts and lib/mock-data.ts.
Read the current app/(dashboard)/brain/page.tsx and components/brain/ to understand existing structure.

TASK: Build the Brain page RIGHT SIDE — the Chat interface.

DESIGN REQUIREMENTS:
- Chat should feel like a modern AI chat (think ChatGPT/Claude style)
- Messages: AI messages have brain icon, user messages aligned right
- AI action buttons inline in messages: [接受] [讨论] [忽略] style
- Session list: compact, scrollable, pinned items on top with 📌
- Input area: clean textarea with send button, feels inviting

IMPLEMENTATION:

1. Create components/brain/session-list.tsx:
   - Horizontal scrollable pill tabs OR vertical sidebar list (pick what fits better)
   - Pinned sessions first (📌 icon)
   - Active session highlighted
   - + New Session button
   - Each session: title + time ago

2. Create components/brain/chat-message.tsx:
   - AI messages: left-aligned, brain emoji/icon avatar, light bg
   - User messages: right-aligned, user avatar, slightly different bg
   - AI messages can contain action buttons (array of {label, variant})
   - Support markdown-like formatting in message content
   - Timestamp on hover or below message

3. Create components/brain/chat-panel.tsx:
   - Top: session list
   - Middle: scrollable message area (auto-scroll to bottom)
   - Bottom: textarea + send button
   - Send handler: adds user message to local state (no real API yet)
   - On send, also add a mock AI response after 500ms delay

4. Wire chat-panel into brain/page.tsx alongside strategy-panel:
   - Desktop: side by side (strategy-panel w-80 | chat-panel flex-1)
   - Mobile: strategy panel collapses, chat takes full width

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step4-brain-chat.log"
log "Step 4: Done"

# ─────────────────────────────────────────────
# Step 5: Flow Page — Feed + Action Cards
# ─────────────────────────────────────────────
log "Step 5: Flow Feed — Starting"
claude -p "
Read docs/SPEC.md section 'Flow' for the full spec. Read lib/types.ts and lib/mock-data.ts.

TASK: Build the Flow page — the daily content queue.

DESIGN REQUIREMENTS:
- This is the CORE daily experience. Must feel fast, satisfying to use
- Cards should have clear visual hierarchy: type badge → content → actions
- Action buttons must be prominent and easy to tap (especially on mobile)
- Each card type has a distinct color/icon so users can scan quickly:
  🔥 TRENDING = red/orange accent
  ✍️ DAILY POST = blue accent
  💬 REPLY NEEDED = purple accent
  🔄 REPOST = green accent
  📨 OUTREACH = teal accent
  👁️ FROM MONITOR = amber accent
- Predicted engagement stars: ⭐ filled vs ☆ empty
- Mobile: full-width cards, large tap targets for approve/skip

IMPLEMENTATION:

1. Create app/(dashboard)/flow/page.tsx:
   - Filter bar at top: [All] [Posts] [Replies] [DMs] [Alerts] as toggle buttons/chips
   - 'Today · X items to review' counter
   - Feed of FlowCard components
   - 'All done for now ✅' message when filtered list is empty

2. Create components/flow/flow-card.tsx:
   - Accepts a FlowItem (union type) and renders differently per type
   - Common structure: type badge + icon | content area | platform tags | action buttons
   - TRENDING: urgency badge with time window ('~4hr left'), draft preview
   - DAILY POST: content pillar tag + format tag, full draft text
   - REPLY NEEDED: quoted original message + suggested reply
   - REPOST: original post preview + your commentary draft
   - OUTREACH: campaign progress (X/Y sent) + personalized DM preview
   - FROM MONITOR: source badge (Reddit/Twitter) + match content + suggested reply
   - Platform icons next to content (Twitter X icon, LinkedIn in icon, etc.)
   - Predicted engagement: 1-5 star rating

3. Create components/flow/flow-actions.tsx:
   - Three buttons per card: primary [Approve ✓], secondary [Chat ✎], ghost [Skip ✗]
   - Primary button label changes per type: Approve/Reply/Send/Repost
   - onClick handlers: Approve removes card with animation, Skip removes with different animation, Chat navigates to post-chat

4. Create components/flow/write-your-own.tsx:
   - Bottom section after all cards (or when all done)
   - Textarea for seed ideas
   - Platform selector: row of toggleable chips (𝕏, in, 📷, 🎵, 🟠, PH)
   - [Generate Draft] button

5. Handle filter state with React useState, filter mock data accordingly

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step5-flow-feed.log"
log "Step 5: Done"

# ─────────────────────────────────────────────
# Step 6: Flow — Post Chat Mode
# ─────────────────────────────────────────────
log "Step 6: Post Chat — Starting"
claude -p "
Read docs/SPEC.md section 'Post Chat' for the full spec. Read lib/types.ts and lib/mock-data.ts.
Read the current components/flow/ directory to understand existing structure.

TASK: Build the Post Chat overlay/panel for Flow.

DESIGN REQUIREMENTS:
- Post Chat is the content refinement experience. Must feel collaborative, not form-like
- Version history should be visually clear: V1 → feedback → V2 → feedback → V3
- Brand Match and Predicted Engagement prominently displayed per version
- The conversation between user and AI should feel natural
- Mobile: full-screen bottom sheet or page

IMPLEMENTATION:

1. Create components/flow/post-chat.tsx:
   - Header bar: post metadata (platform icons, pillar, format) + [Back to Flow] button
   - Version timeline: V1, V2... each as a card showing:
     * Version number badge
     * Full draft text
     * Brand Match: X% (colored: green>85%, yellow>70%, red<70%)
     * Predicted: star rating
   - Between versions: user's feedback message (shown as chat bubble)
   - Bottom: text input for user feedback + send button

2. Create components/flow/post-version.tsx:
   - Single version card with draft text, brand match, prediction
   - Visual diff hint (optional: highlight what changed from previous version)

3. Action bar at bottom of Post Chat:
   - [Approve VX → Schedule] primary button (uses latest version)
   - [我自己写最终版] secondary button → reveals:
     * Editable textarea pre-filled with latest version
     * Live Brand Match score updating as user types (mock: random 80-95%)
     * [Submit → Schedule] button

4. Learning Note section at very bottom:
   - Shows what AI learned from this interaction (from mock data)
   - Two buttons: [对，记住这个] [这次特殊]
   - Clicking either dismisses the note with a brief confirmation

5. Integrate with Flow page:
   - When user clicks [Chat ✎] on a flow card, show Post Chat
   - Use URL state or React state to track: which item is open, post-chat mode on/off
   - Back button returns to Flow feed

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step6-postchat.log"
log "Step 6: Done"

# ─────────────────────────────────────────────
# Step 7: Calendar Page
# ─────────────────────────────────────────────
log "Step 7: Calendar — Starting"
claude -p "
Read docs/SPEC.md section 'Calendar' for the full spec. Read lib/types.ts and lib/mock-data.ts.

TASK: Build the Calendar page with all sections.

DESIGN REQUIREMENTS:
- Calendar grid: clean, light backgrounds, colored status dots/borders
- Published=green, Scheduled=blue, Draft=gray
- Today column highlighted
- Platform icons should be small and recognizable
- Cadence bars: thin horizontal progress bars
- Playbook timeline: step indicator (dots connected by line)
- Mobile: switch to day view by default

IMPLEMENTATION:

1. Create app/(dashboard)/calendar/page.tsx with [Week] [Month] toggle (Week default)

2. Create components/calendar/week-view.tsx:
   - 7 columns for days of the week (Mon-Sun)
   - Time rows from 8am to 6pm
   - Slots rendered as small cards in the grid:
     * Platform icon (small) + content snippet (truncated)
     * Background color by status (green/blue/gray tint)
   - Clickable slots (console.log for now)
   - Today's column with subtle highlight background
   - Current time indicator line

3. Create components/calendar/today-timeline.tsx:
   - Chronological list of today's posts
   - Published: ✅ icon + time + platform + content preview + impressions/engagement stats
   - Scheduled: 🕐 icon + time + platform + content preview + [Preview] [Edit] [Reschedule] buttons
   - Clear visual distinction between past (published) and future (scheduled)

4. Create components/calendar/cadence-overview.tsx:
   - Grid of platform cadence cards:
     * Platform icon + name
     * 'X/Y posts this week' text
     * Progress bar (filled to current %)
     * Status text: 'on track' / '1 gap Thu' / 'need 1 more'
   - [Auto-fill gaps with AI drafts] button
   - [Adjust cadence → Brain] link (href to /brain)

5. Create components/calendar/playbook-timeline.tsx:
   - Only renders if there's an active playbook
   - Playbook name + 'Day X of Y'
   - Horizontal step indicator: ✅ completed, 🔵 current, ○ upcoming
   - Today's playbook tasks checklist

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step7-calendar.log"
log "Step 7: Done"

# ─────────────────────────────────────────────
# Step 8: Monitor Page
# ─────────────────────────────────────────────
log "Step 8: Monitor — Starting"
claude -p "
Read docs/SPEC.md section 'Monitor' for the full spec. Read lib/types.ts and lib/mock-data.ts.

TASK: Build the Monitor page with all 4 sections.

DESIGN REQUIREMENTS:
- This is a surveillance/radar dashboard — should feel like a command center
- Alerts section: red/amber cards stand out visually, feel urgent
- Feed: timeline style, color-coded dots for item types
- Active Monitors: card-based, each platform has its own card with stats
- Post Reply Tracker: compact, status-focused

IMPLEMENTATION:

1. Create app/(dashboard)/monitor/page.tsx with 4 stacked sections

2. Create components/monitor/active-monitors.tsx:
   - Card per platform (Reddit, Twitter, LinkedIn, PH)
   - Each card shows:
     * Platform icon + name
     * Keywords/accounts being monitored (as tags/chips)
     * Last 7 days stats: 'X matches, Y acted on'
     * Inline edit buttons: [Edit keywords] [Add subreddit/competitor]
   - [+ Add Monitor] button at bottom
   - [Ask Brain to set up] link

3. Create components/monitor/alerts-section.tsx:
   - Section header: '🚨 ALERTS' with count badge
   - Alert cards with red/amber left border:
     * Severity icon (⚠️ COMPLAINT DETECTED / ⚠️ NEGATIVE MENTION)
     * Source: platform + username + time ago
     * Quoted content
     * Engagement stats (impressions, likes, replies)
     * AI suggested response in a subtle box
     * Actions: [Reply ✓] [Chat ✎] [Escalate to team] / [Skip ✗]
     * 'Also pushed to Flow' badge

4. Create components/monitor/monitor-feed.tsx:
   - Filter bar: [All] [Reddit] [Twitter] [LinkedIn] [Mentions] [Competitors] [Keywords]
   - Timeline of items, each with:
     * Color dot: 🟢 MATCH, 🟡 MENTION, 🔵 INFO, 🔴 ALERT
     * Time ago + platform icon
     * Content preview
     * Keyword/trigger that matched
     * Actions: [Push to Flow] [Note for Brain] [Ignore]
     * Processed items: '→ Replied ✅' / '→ Auto-replied ✅' / '→ Pushed to Flow ✅'
   - [Load more...] at bottom

5. Create components/monitor/reply-tracker.tsx:
   - Header: 'Post Reply Tracker' + Auto-check toggle + frequency display
   - [Check now] button
   - List of user's posts with new replies:
     * Platform icon + post title/snippet + 'X new replies'
     * Status: '→ 已推入Flow待处理' / '→ X条auto-replied ✅'

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step8-monitor.log"
log "Step 8: Done"

# ─────────────────────────────────────────────
# Step 9: Pulse Page
# ─────────────────────────────────────────────
log "Step 9: Pulse — Starting"
claude -p "
Read docs/SPEC.md section 'Pulse' for the full spec. Read lib/types.ts and lib/mock-data.ts.

TASK: Build the Pulse analytics page with all sections.

DESIGN REQUIREMENTS:
- Dashboard feel: cards with numbers, charts, progress indicators
- Strategy Health: circular or large score display + 5 dimension bars
- Numbers: big headline metrics with deltas (green ↑ / red ↓)
- Charts: use recharts library (install it) for line charts
- Top Content: card format with AI analysis callout
- AI Learning Progress: the star section — show AI getting smarter over time
- Time range toggle should feel natural (7d/30d/90d)

IMPLEMENTATION:

First install recharts: pnpm add recharts

1. Create app/(dashboard)/pulse/page.tsx with [7d] [30d] [90d] toggle

2. Create components/pulse/strategy-health.tsx:
   - Overall score: large number with color (green>75, yellow>50, red<50)
   - 5 dimension bars: Content Quality, Consistency, Engagement Trend, Brand Voice Match, Audience Growth
   - Each bar: label + progress bar + percentage
   - Low dimensions (<70%): amber ⚠️ + suggestion text below
   - [Ask Brain] link button

3. Create components/pulse/goal-progress.tsx:
   - Each goal: icon + title + progress bar + current value + pace text
   - Same color coding as Brain Strategy Panel

4. Create components/pulse/ai-insights.tsx:
   - Cards with 💡 icon
   - Each insight: observation text + bold actionable suggestion
   - [Ask Brain for deeper analysis] link at bottom

5. Create components/pulse/numbers-overview.tsx:
   - 3 big metric cards: Followers, Impressions, Engagement Rate
   - Each: big number + delta with arrow (green ↑ positive, red ↓ negative) + '(30d)' label
   - Line chart below (recharts LineChart) showing trend over selected time range
   - Per-platform breakdown: small row of platform icon + number + delta

6. Create components/pulse/top-content.tsx:
   - 'This week best' section: ranked cards
   - Each: rank number + platform icon + content preview + metrics (imp, engage, followers gained)
   - 'Why it worked' AI analysis in italic/muted text
   - [Open Post Chat] link
   - 'This week worst' section: same format with 'Why it flopped'

7. Create components/pulse/ai-learning.tsx:
   - Brand Voice Accuracy: trend line with weekly data points + current %
   - One-tap Approve Rate: same format
   - Stats: Total Interactions, Learned Patterns, Active Rules
   - 'Recent Learnings' list:
     * Each: 📝 + date + learning text
     * [对] [这次特殊] / [对] [恢复] buttons
   - [View all learned patterns →] link
   - [Reset AI memory → Brain] link

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step9-pulse.log"
log "Step 9: Done"

# ─────────────────────────────────────────────
# Step 10: Settings Page
# ─────────────────────────────────────────────
log "Step 10: Settings — Starting"
claude -p "
Read docs/SPEC.md section 'Settings' and docs/SPEC-SUPPLEMENT.md Part 3 (Team) and Part 4 (Notifications).
Read lib/types.ts and lib/mock-data.ts.

TASK: Build the Settings page with all tabs.

DESIGN REQUIREMENTS:
- Clean settings UI: tabs on left (desktop) or top (mobile)
- Form sections with clear labels and descriptions
- Toggles for on/off settings (shadcn Switch)
- Sliders for voice parameters (shadcn Slider)
- Grouped sections with headers and subtle separators

IMPLEMENTATION:

First install needed shadcn components:
pnpm dlx shadcn@latest add tabs textarea select slider switch

1. Create app/(dashboard)/settings/page.tsx with tab navigation:
   Tabs: Account, Brand Profile, Schedule, Auto-Reply, Monitor, Notifications, Team, Billing

2. Create components/settings/account-tab.tsx:
   - Platform connection cards (Twitter, LinkedIn, Instagram, Reddit, PH, TikTok)
   - Each: platform icon + name + connection status badge (connected/disconnected)
   - [Connect] / [Disconnect] button per platform
   - API permission status indicators

3. Create components/settings/brand-profile-tab.tsx:
   - Identity section: name, company, role, domain, positioning (text inputs)
   - Voice Parameters section: sliders for formality, technicality, humor, assertiveness, emoji_usage
     Each slider: label on left, 0-1 range, descriptor on each end (e.g. 'Casual' ↔ 'Formal')
   - Content Pillars: list with topic + weight (editable), [Add pillar] button
   - Rules: textarea for prohibited topics/words
   - Anchor Creators: tag input for @handles
   - [Save changes] button

4. Create components/settings/schedule-tab.tsx:
   - Per-platform: frequency input (X posts per day/week) + preferred time slots
   - Timezone selector dropdown

5. Create components/settings/auto-reply-tab.tsx:
   - Per-platform toggle (Switch) + style selector (Select: friendly/professional/casual)
   - Escalation conditions textarea
   - Auto-reply log preview (last 5 auto-replies)

6. Create components/settings/monitor-tab.tsx:
   - Keywords input (tag-style)
   - Subreddit list (tag-style)
   - Competitor accounts (tag-style)
   - Check frequency slider
   - Notification preferences per monitor type

7. Create components/settings/notifications-tab.tsx:
   - Table/grid from SPEC-SUPPLEMENT Part 4:
     Notification type rows × channel columns (In-app, Push, Email)
     Each cell is a Switch toggle
   - All populated with mock defaults

8. Create components/settings/team-tab.tsx:
   - Team members list: avatar + name + role badge + [Change role] [Remove]
   - [Invite member] button
   - Approval Workflow selector: 'Simple' vs 'Strict' mode (radio)
   - Descriptions of what each mode does

9. Create components/settings/billing-tab.tsx:
   - Current plan card: plan name + price + features
   - Usage stats: identities used, posts this month, AI calls
   - [Upgrade] / [Manage subscription] buttons (placeholder)

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step10-settings.log"
log "Step 10: Done"

# ─────────────────────────────────────────────
# Step 11: Onboarding Flow
# ─────────────────────────────────────────────
log "Step 11: Onboarding — Starting"
claude -p "
Read docs/SPEC-SUPPLEMENT.md Part 1 (Onboarding) for the full spec.
Read lib/types.ts, lib/mock-data.ts, and the existing components/ structure.

TASK: Build the Onboarding flow as a multi-step wizard.

DESIGN REQUIREMENTS:
- Onboarding should feel warm, exciting, personal — not corporate
- Each step transitions smoothly (slide or fade)
- Progress indicator: subtle dots or step numbers at top
- The AI analysis step (Step 2) should feel magical — real-time discovery animation
- Large, inviting buttons. Minimal text. Let the user feel momentum
- Mobile-first: this is likely the first thing users see on any device

IMPLEMENTATION:

1. Create app/(onboarding)/layout.tsx — clean layout without sidebar, just centered content
2. Create app/(onboarding)/page.tsx — the onboarding wizard

3. Create components/onboarding/onboarding-wizard.tsx:
   - Manages step state (1-6), transitions between steps
   - Progress indicator at top

4. Create each step as a component:

   components/onboarding/step-welcome.tsx (Step 1):
   - Welcome text
   - Platform connect buttons: Twitter, LinkedIn, Instagram, Skip
   - Multi-select (can connect multiple)

   components/onboarding/step-analyzing.tsx (Step 2):
   - Animated checklist that reveals items one by one (staggered, 1-2 sec apart):
     ✅ Found X posts → ✅ Identified domain → ✅ Writing style → ✅ High-performance patterns → 🔄 Generating Brand Voice...
   - Use setTimeout or setInterval to simulate the progressive reveal
   - Each item fades/slides in

   components/onboarding/step-bootstrap.tsx (Step 2b - no history):
   - Conversational questions one at a time (chat-like interface)
   - 5-8 questions, each revealed after answering previous
   - Questions from spec: what do you do, target audience, controversial opinion, favorite creators, formal vs casual

   components/onboarding/step-confirm.tsx (Step 3):
   - Display AI understanding: identity tags, voice description, topics
   - [对！] primary button, [调整一下] secondary
   - If adjust: show inline editable fields

   components/onboarding/step-goals.tsx (Step 4):
   - Goal selection chips: [增长followers] [建立authority] [consistent presence] [导流产品]
   - Platform focus: [Twitter为主] [LinkedIn为主] [均衡]
   - AI recommendation text with suggested cadence
   - [Looks good] [调整]

   components/onboarding/step-first-post.tsx (Step 5):
   - AI-generated draft in a card
   - Brand Match score
   - [Approve → Schedule] [Chat → 修改] [Skip → 明天再发]
   - This is a mini Post Chat experience

   components/onboarding/step-done.tsx (Step 6):
   - Success message with ✨
   - Summary of what's set up
   - [进入Flow →] button linking to /flow

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step11-onboarding.log"
log "Step 11: Done"

# ─────────────────────────────────────────────
# Step 12: Mobile Responsive Pass
# ─────────────────────────────────────────────
log "Step 12: Mobile Responsive — Starting"
claude -p "
Read docs/SPEC-SUPPLEMENT.md 'Mobile考虑' section.
Read all existing page and component files in app/(dashboard)/ and components/.

TASK: Do a full mobile responsive pass on ALL pages.

REQUIREMENTS from spec:
- Flow on mobile: full-width cards, swipe-friendly, large tap targets
- Post Chat on mobile: bottom sheet style (full-screen slide-up)
- Brain on mobile: full-screen chat, Strategy Panel collapses into expandable header
- Calendar on mobile: default to day view
- Monitor on mobile: stacked sections, full-width cards
- Pulse on mobile: stacked cards, charts resize
- Settings on mobile: tabs become horizontal scrollable pills at top
- Sidebar on mobile: sheet/drawer that slides in from left (should already be from Step 1)

IMPLEMENTATION:
- Go through EVERY page component and ensure proper responsive classes
- Use Tailwind breakpoints: mobile-first approach (default=mobile, md:=tablet, lg:=desktop)
- Ensure all tap targets are at least 44px on mobile
- Ensure no horizontal overflow on any page at 375px width
- Brain: add a collapsible/expandable strategy panel for mobile using Sheet or Collapsible
- Calendar: add day view component and default to it on mobile
- Post Chat: wrap in Sheet component on mobile
- Test: check all pages render correctly with responsive classes

After implementing, run: pnpm build
" $FLAGS 2>&1 | tee "$LOGDIR/step12-mobile.log"
log "Step 12: Done"

# ─────────────────────────────────────────────
# Step 13: Final Build Verification
# ─────────────────────────────────────────────
log "Step 13: Final Verification — Starting"
claude -p "
TASK: Final build verification and cleanup for Deely Phase 1.

1. Run pnpm build — fix ANY errors
2. Check for TypeScript errors: pnpm exec tsc --noEmit
3. Review all pages for:
   - Consistent import paths
   - No unused imports
   - No console.log left in production code (console.log in event handlers is OK for now)
   - All components properly exported
4. Verify all 6 dashboard routes work (check for missing files)
5. Verify onboarding route works
6. Check that sidebar navigation links point to correct routes
7. Make sure there are no hardcoded colors that should use Tailwind classes
8. Ensure all interactive elements have proper cursor styles and hover states

Fix everything you find. Run pnpm build again after fixes.
" $FLAGS 2>&1 | tee "$LOGDIR/step13-verify.log"
log "Step 13: Done"

log "========================================="
log "Deely Phase 1 Build — COMPLETE"
log "========================================="
log "Check logs/ directory for detailed output"
log "Run 'pnpm dev' to see the result"
