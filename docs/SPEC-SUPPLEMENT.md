# 补充规格：Onboarding + 多身份 + Team + AI架构

**V4 Supplement | March 2026**

---

## Part 1: Onboarding

### 设计原则
- 10分钟内发出第一条AI-assisted帖子
- 不填表格，全对话完成
- 让用户在onboarding过程中就感受到"AI懂我了"
- 结束时用户已经有明天的content queue等着

### 完整流程

Step 1: Welcome（10秒）— 连接平台账号（至少一个）
Step 2: AI分析中（30-60秒）— 实时展示分析发现（找到X条帖子、识别风格、高表现模式等）
Step 2b: 对话式bootstrap（无历史内容时）— 5-8个对话式问题
Step 3a: Confirm — 展示AI对用户的理解，用户确认或调整
Step 4: 设定Goal（30秒）— 选择目标 + AI推荐发布节奏和strategy
Step 5: 第一条帖子（60秒）— AI生成draft，用户体验Post Chat
Step 6: Done — 引导进入Flow

### Onboarding后的前7天留存设计

| Day | 触发 | 目的 |
|-----|------|------|
| Day 1 | 发出第一条帖子 + 4hr后performance通知 | "这个有用" |
| Day 2 | 打开app看到3条ready drafts | "它在为我工作" |
| Day 3 | AI发Learning Note："我发现你喜欢短句" | "它在学习" |
| Day 4 | 推一个trending topic | "它能帮我抓住机会" |
| Day 5 | 第一条engagement summary | "我有进步了" |
| Day 6 | Brain建议micro策略调整 | "它在主动帮我优化" |
| Day 7 | 展示本周数据 vs 上周对比 | "quantified improvement" |

---

## Part 2: 多身份 / 多品牌系统

### 场景

一个用户可能同时管理多个身份（个人brand、公司账号、产品账号）。每个身份有完全独立的Brand Voice Profile、Goals、Strategy、Content Pillars、发布节奏、Analytics。但共享用户账号、计费、部分team成员。

### 界面

全局切换器在sidebar顶部。切换identity后整个产品context变化。

### 新增Identity流程

+ Add Identity → mini onboarding（连接平台 → AI分析 → 设定Brand Voice → 设定Goals）

### Identity之间的关系

完全隔离：Brand Voice Profile、Content queue、Analytics、Auto-reply rules
可以共享：Brain sessions（跨identity讨论）、Monitor alerts、Content改写（一键转tone）

### 定价影响

- Solo: 1 identity
- Growth: 2 identities
- Team: Unlimited identities

---

## Part 3: Team Collaboration

### 角色设计

- Owner: 完全控制权
- Admin: 可改Strategy和Settings，不能改Billing
- Editor: 可创建/编辑/approve content，不能改Strategy
- Viewer: 只能看Analytics和Calendar

### Team在各页面的体现

- Brain: 所有人可看session history，只有Owner/Admin可改Strategy
- Flow: Editor写的content需要Owner/Admin approve，AI对所有人做Brand Voice Check
- Calendar: 所有人看同一个Calendar，显示"by [name]"
- Monitor: Complaint自动通知Owner
- Pulse: Team member performance对比

### Approval Workflow

简单模式：AI生成→Editor approve→发布 / Editor写→AI Check→直接发布(match>85%) or 需Owner approve(match<85%)
严格模式：任何内容→AI Check→Owner/Admin approve→发布

---

## Part 4: 其他

### Notification System

通知类型：帖子发布成功、performance里程碑、需回复mention、Monitor alert、Brain策略建议、Team approval request、每日Flow ready、周报summary、Goal behind提醒、Playbook里程碑

渠道：In-app（全部）、Push（重要的）、Email（严重alert + approval + 周报）

### Mobile考虑

Responsive web（Phase 1不做native）：
- Flow: 核心移动体验，从上到下刷
- Post Chat: bottom sheet
- Brain: 全屏chat（Strategy Panel折叠成header）
- Calendar: 默认day view

### Integration Layer

平台API: Twitter/X, LinkedIn, Instagram, Reddit, Product Hunt, TikTok
GTM工具: Clay, HubSpot, Salesforce
Workflow: Slack, Zapier/Make
Content: Canva, Notion

### 数据导出

所有AI生成的content、Post Chat历史、Analytics CSV、Brand Voice Profile JSON、Learning Notes

---

## Part 5: AI系统架构

### 4层架构

Layer 1 MEMORY（存储层）：Brand Voice Profile（structured JSON + vector embeddings）、Episodic Memory（每次交互记录）、Performance Data（时间序列）

Layer 2 LEARNING（学习层，异步）：Post-level Learner（每次交互后）、Pattern Learner（每周批量）、Strategy Learner（每2周+触发式）

Layer 3 PERSONALIZATION（个性化层，实时）：每次生成时从Memory取Brand Voice Profile + 最相关past examples + winning patterns，组装generation prompt

Layer 4 GENERATION（生成层）：Multi-LLM Router — Claude(策略/长文/nuanced) + GPT-4o(短帖子批量) + Gemini(多模态)

### Memory存储设计

brand_voice_profile: identity + voice参数(formality/technicality/humor/assertiveness/emoji_usage等) + content_pillars + preferred_formats(权重) + rules + anchors

episodic_memory: 每条content的完整lifecycle（ai_draft_v1→user_feedback→ai_draft_v2→final_version→edits_summary→learning_note→performance）

learned_patterns: pattern描述 + confidence + evidence_count + signal(positive/negative) + performance_multiplier

strategy_state: goals + current_strategy + active_playbook + health_score

### 关键AI设计决策

1. Symbolic learning（外部structured数据）而非parametric learning（fine-tune）— 透明、可编辑、无catastrophic forgetting
2. Learning异步，Personalization实时
3. Vector embedding用于找最相关past content作为few-shot examples
4. 用户反馈信号强度排序：用户重写 > explicit feedback > significant edit > minor edit > approve > skip > performance data
5. Learning Note必须可纠正：[对，记住这个] [这次特殊]
6. Multi-LLM routing与Lumn multi-provider理念对齐
