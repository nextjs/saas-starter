# 完整页面 & 功能规格书（Final）

**V4 | March 2026**

---

## 导航结构

```
🧠 Brain
⚡ Flow
📅 Calendar
👁️ Monitor
📊 Pulse
⚙️ Settings
```

6个flat页面，没有子页面，没有展开菜单。点哪个就是哪个。

变化说明：Monitor从Flow里独立出来成为top-level页面。原因：Monitor是"持续后台运行的雷达"，和Flow的"今天需要你处理的任务"是不同的心智模型。Flow是主动做事，Monitor是被动监听。当Monitor发现了需要处理的东西，会把它推进Flow。

---

## 🧠 Brain

### 定位

策略中枢 + 对话入口 + Goal/Strategy可视化面板。左侧不是空白，而是始终展示当前的Goal和Strategy状态。右侧是对话区。

### 功能

**左侧 Strategy Panel（始终可见）**

这不是空白区域，是一个live dashboard，展示：

**Goals区域：**
- 当前所有active goals，每个有进度条+pace indicator（on track / behind / ahead）
- 点击[Edit Goals]可以直接inline编辑，或者在Chat里说"加一个新目标"
- Goal类型支持：follower增长、engagement rate、发帖频率、pipeline（B2B tier）
- 每个goal的deadline和当前pace
- Behind的goal标黄⚠️，提醒用户注意

**Strategy区域：**
- Content Pillars + 当前分配比例
- 每个平台的发布节奏
- Auto-reply当前状态
- Active Playbook（如果有正在执行的campaign）
- 所有这些都是可以通过右侧Chat对话修改的——左侧展示当前状态，右侧是修改入口

**右侧 Chat**

**Session管理：**
- 顶部是session列表（可pinned、按时间排序）
- 📌 Brand Setup是永久pinned的session，存储Brand Voice Profile的完整记录
- 每个session有标题，自动根据对话内容命名
- + New Session开始新对话

**Chat可以做的所有事情：**

策略类：
- "我想把focus从payment转到AI agent" → 更新左侧Strategy Panel
- "加一个新目标：这个月在Reddit获得500 karma" → 更新Goals
- "我的PH launch推迟到3/20" → 更新Playbook时间线和Calendar
- "blog post目标太aggressive了，改成每两周一篇" → 更新Goal

创作类：
- "帮我brainstorm关于___的内容" → 生成多个idea
- "我刚看到___新闻，帮我写一条hot take" → 生成draft → 可以直接[加入Flow]
- "帮我准备PH launch的所有材料" → 启动Playbook，生成tagline/description/first comment

配置类：
- "把LinkedIn的auto-reply关掉" → 更新Settings
- "监控r/SaaS上关于payment API的帖子" → 更新Monitor配置
- "加一个竞品监控：@competitor" → 更新Monitor
- "我的写作风格最近想更casual一些" → 更新Brand Voice Profile

分析类：
- "为什么我上周的engagement下降了？" → AI分析数据给出原因
- "我的什么类型的内容表现最好？" → 数据驱动的回答
- "和上个月比我的进步在哪？" → 对比分析

**Brain的主动行为（AI主动触发对话）：**
- 每2周自动strategy review → 推送到Chat
- Goal进度behind时提醒
- 检测到用户连续skip AI推荐时发起诊断对话
- 发现用户使用pattern变化时主动询问

---

## ⚡ Flow

### 定位

每天的工作台。所有"需要你做一个决定"的item，按优先级排在一个统一feed里。处理完就走。

### Flow的item优先级排序逻辑

```
Priority 1: 时效性内容（trending topic，窗口有限）
Priority 2: 需要回复的互动（别人在等你）
Priority 3: 从Monitor推过来的高匹配度alert
Priority 4: 每日AI content drafts
Priority 5: Outreach DMs
Priority 6: Repost/互动机会
```

### 每个item的3个action

**[Approve ✓] / [Reply ✓] / [Send ✓] / [Repost ✓]**
一键完成。AI draft直接使用，排入Schedule（post类）或立即发送（reply/DM类）。

**[Chat ✎]**
打开Post Chat对话模式。用户可以和AI来回讨论修改这条内容。

**[Skip ✗]**
跳过。AI记录并学习。

### Post Chat（点击Chat ✎后打开的界面）

- 展示版本历史（V1, V2...）
- Brand Match分数 + Predicted Engagement
- 用户可来回修改
- Learning Note（AI学到了什么）
- [对，记住这个] [这次特殊] 按钮

### 底部"Write your own"

用户自己想写东西时的入口。
- 输入seed idea → AI扩展成完整draft → 进入Post Chat打磨
- 直接写完整帖子 → AI做Brand Voice Check + Predicted Engagement → 直接Schedule
- 选择目标平台后，AI自动生成每个平台的适配版本

### 多平台内容创作能力

**Twitter/X：** Short post、Thread、Quote tweet、Reply
**LinkedIn：** Professional post、Short insight
**Instagram：** Caption + AI建议拍什么照片/图片描述。Reel脚本 + 分镜建议
**TikTok：** 视频脚本（hook/body/CTA）+ 画面描述 + 配文
**Reddit：** 帖子（适配Reddit tone）+ Comment draft
**Product Hunt：** Tagline、Description、Maker's first comment、FAQ
**Indie Hackers：** Build-in-public update、Milestone分享

### AI辅助（Post Chat里可用的工具）

- Rewrite / Shorter / Longer / Bolder / Softer
- Add hook / Generate 3 variants
- Adapt to [platform]
- Brand Voice Check / Predicted Engagement

---

## 📅 Calendar

### 定位

时间线视图。所有已排期的、已发布的、计划中的内容。

### 功能

**日历网格：**
- 周视图（默认）和月视图切换
- 每个slot：平台icon + 内容缩略 + 状态色（绿=已发、蓝=已排期、灰=draft）
- 拖拽调整时间
- 点击任何slot → 打开该帖子的Post Chat

**Today's Timeline：**
- 当日已发布内容 + 实时performance数据
- 即将发布内容 + 预览/编辑/改时间

**Cadence Overview：**
- 每个平台本周完成度
- 有gap的地方标出来
- [Auto-fill gaps]：AI自动为空缺slot生成draft推入Flow
- [Adjust cadence → Brain]

**Active Playbook Timeline：**
- 正在执行的Playbook进度
- 每天的playbook任务和完成状态

---

## 👁️ Monitor

### 定位

后台持续运行的雷达系统。先展示"我在帮你监控什么"，然后展示"发现了什么值得你关注的"。

### Monitor的四个区域

**Active Monitors（顶部）：**
- Reddit关键词+subreddits
- Twitter品牌提及+竞品账号
- LinkedIn品牌提及
- Product Hunt评论
- 每个monitor显示最近7天数据

**Alerts（红色/黄色，最高优先级）：**
- 产品complaint / 负面评论
- 竞品重大动态
- 同时push到Flow

**Feed（全量监控结果流）：**
- 🟢 MATCH / 🟡 MENTION / 🔵 INFO / 🔴 ALERT
- [Push to Flow] [Note for Brain] [Ignore]

**Post Reply Tracker（底部）：**
- 追踪用户之前发过的帖子新回复
- Auto-check开关 + 频率设置

---

## 📊 Pulse

### 定位

体检报告。数据 + AI洞察 + 进化进度 + 策略健康度。

### Sections

**Strategy Health：** 5个维度综合评分（Content Quality, Consistency, Engagement Trend, Brand Voice Match, Audience Growth）

**Goal Progress：** 详细pace和趋势数据

**AI Insights：** Actionable发现，"发现X → 建议Y"结构

**Numbers：** 跨平台汇总 + 按平台breakdown + growth chart

**Top Content：** Best/worst content + AI原因分析

**AI Learning Progress：** Brand Voice Accuracy趋势、One-tap Approve Rate趋势、本周学到了什么

---

## ⚙️ Settings

Account连接、Brand Profile、Schedule Settings、Auto-Reply Rules、Monitor Settings、Outreach Settings、Team Settings（B2B）、Plan & Billing

---

## 页面间的数据流

```
Brain ──设定strategy/goals──→ 影响Flow的内容推荐
Brain ──设定monitor规则────→ 影响Monitor的监控范围
Brain ──启动playbook───────→ Calendar排入计划 + Flow推送每日任务

Flow ──用户approve/edit/skip──→ Pulse的AI Learning Progress
Flow ──用户处理monitor alert──→ Monitor标记为已处理
Flow ──用户approve post─────→ Calendar排入schedule

Monitor ──发现高优先item──→ Push到Flow
Monitor ──发现竞品动态────→ 可以Note到Brain
Monitor ──发现complaint───→ Push到Flow(高优先级)

Calendar ──有gap需要填充──→ AI生成draft推入Flow
Calendar ──playbook任务──→ Push到Flow

Pulse ──strategy health⚠️──→ 链接到Brain讨论
Pulse ──learning progress──→ 持续优化Flow的推荐质量
```

---

## 开发优先级

### Phase 1 MVP（Month 1-3）

| 页面 | 功能 | 平台 |
|------|------|------|
| Brain | 基础对话 + Strategy Panel（Goals+Pillars+Cadence） | — |
| Flow | Daily content queue + Post Chat（含learning） + Write your own | 𝕏 + in |
| Calendar | 基础周视图 + schedule + 已发布数据 | 𝕏 + in |
| Pulse | Numbers + Top Content + AI Learning Progress | 𝕏 + in |
