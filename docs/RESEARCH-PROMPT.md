# Deely AI System Research Prompt

复制以下内容到一个新的 Claude session 开始 research。

---

## PROMPT START

我在做一个叫 Deely 的产品——AI-powered social media strategy & content management platform。我需要你帮我做深度 research，确保我们的 AI 系统设计是业界最优的。

### 产品核心 AI 能力

Deely 的 AI 需要做这些事情：

1. **Brand Voice 复制** — 分析用户的历史社交媒体内容，学会他们的写作风格，然后生成听起来完全像他们自己写的新内容。这是核心壁垒。

2. **Content Generation** — 根据用户的 Brand Voice Profile + Content Pillars + 平台规则，生成不同格式的社交媒体内容（tweet, thread, LinkedIn post, Reddit reply 等）。

3. **持续学习/进化** — 每次用户 approve/edit/reject AI 生成的内容，系统要学习并改进。用 symbolic learning（外部存储 patterns）而不是 fine-tuning。用户可以看到、编辑、删除 AI 学到的东西。

4. **Brand Voice Matching Score** — 实时评估一段文本和用户的 Brand Voice 匹配度（0-100%）。

5. **Engagement Prediction** — 预测一条帖子的 engagement 表现（基于用户历史数据）。

6. **Strategy Analysis** — 分析用户的 content performance 数据，给出 actionable 的策略建议。

7. **跨平台内容适配** — 同一条内容自动改写为不同平台的 tone 和 format。

8. **Sentiment/Complaint Detection** — 检测 mentions 中的情感倾向，识别 complaints 和负面评论。

### 我们的架构设计（需要验证和优化）

我们设计了4层架构：

- **Layer 1 MEMORY**: Brand Voice Profile（structured JSON）+ Episodic Memory（每次交互记录）+ Performance Data + Vector Embeddings of past content
- **Layer 2 LEARNING**: Post-level Learner（每次交互后，提取 edit patterns）+ Pattern Learner（每周批量）+ Strategy Learner（每2周）
- **Layer 3 PERSONALIZATION**: 每次生成时从 Memory 检索最相关的 past examples + winning patterns，组装 prompt
- **Layer 4 GENERATION**: Multi-LLM Router（Claude/GPT-4o/Gemini 按任务类型路由）

核心思路：
- Symbolic learning（JSON + vector DB）而非 parametric learning（fine-tuning）
- 用户反馈作为最强学习信号
- Vector similarity 检索历史内容作为 few-shot examples
- Learning Notes 让用户可以纠正 AI 学到的东西

### 我需要你 research 的具体问题

请对以下每个领域做深度 research，找到最新的论文、开源项目、产品案例、最佳实践：

---

#### Research Area 1: Brand Voice / Writing Style Cloning

- 当前最先进的 style transfer / style mimicry 方法是什么？
- 有哪些 papers 研究用 LLM 复制特定人的写作风格？
- Few-shot prompting vs fine-tuning vs RAG-based style matching，哪种效果最好？在什么数据量下？
- 怎么量化 "Brand Voice accuracy"？有没有现成的 evaluation metrics？
- 具体需要多少历史内容才能有效建模一个人的风格？（10条？50条？200条？）
- 竞品分析：Jasper, Lately, Typefully, Buffer AI, Hootsuite OwlyWriter 等产品是怎么做 brand voice 的？它们用的什么技术方案？
- 有没有 style-transfer 相关的 benchmark 或 evaluation dataset？

#### Research Area 2: Prompt Engineering for Personalized Content Generation

- 2024-2026 最新的 prompt engineering best practices 是什么？
- System prompt 里 voice parameters 应该怎么结构化？（JSON schema? natural language? structured blocks?）
- 怎么有效使用 few-shot examples？最佳数量是多少？怎么选择最相关的 examples？
- 当 context window 有限时，怎么最大化 prompt 效率？
- 有没有 research 比较 "描述风格" vs "展示examples" 的效果差异？
- Chain-of-thought 或 step-by-step reasoning 对内容生成质量有帮助吗？
- 怎么在 prompt 里有效编码 "negative examples"（用户不喜欢的风格）？

#### Research Area 3: Learning from User Feedback (Symbolic/In-context Learning)

- MAPLE 论文和类似的 memory/learning/personalization 分离架构有哪些？
- 有哪些 papers 研究从 user edits 中提取 preference 的方法？
- RLHF 之外，有没有更轻量的从用户反馈中学习的方法？
- Constitutional AI 的思路能不能用在 brand voice learning 上？
- 怎么防止 over-fitting to recent feedback？怎么设计 confidence decay？
- 有没有开源的 "preference learning from edits" 实现？
- MemGPT / LangMem / Zep / Mem0 等 memory 系统的对比分析？哪个最适合我们的场景？
- 有没有研究 "learning notes" 或 "transparent AI learning" 让用户可以纠正的？

#### Research Area 4: Vector Search for Content Similarity

- 用什么 embedding model 做社交媒体内容的 similarity search 最好？（OpenAI ada? Cohere? open source?）
- pgvector vs Pinecone vs Weaviate vs Qdrant，我们的场景（每用户几百到几千条内容）用什么最合适？
- 怎么设计 embedding strategy？整条帖子做一个 embedding？还是分段？
- Hybrid search（vector + keyword）对我们的场景有帮助吗？
- 检索后怎么 rank/filter 确保 examples 的质量？
- Retrieval-Augmented Generation (RAG) 最新的 best practices？

#### Research Area 5: Content Quality Evaluation & Engagement Prediction

- 怎么自动评估 AI 生成的社交媒体内容的质量？
- 有没有 research 能预测一条帖子的 engagement？用什么特征？
- Brand voice consistency 怎么用 AI 自动打分？（用另一个 LLM call？用 embedding similarity？用 classifier？）
- 有没有开源的 social media content quality scorer？
- A/B testing 框架在 AI content generation 场景里怎么设计？

#### Research Area 6: Multi-LLM Routing & Cost Optimization

- 有没有 research 比较不同 LLM 在 social media content generation 上的效果？
- Claude vs GPT-4o vs Gemini vs Llama 在不同内容类型上的对比？
- LLM routing 的 best practices？（Martian, OpenRouter, Not Diamond 等）
- 怎么设计一个 cost-efficient 的 multi-model pipeline？
- 哪些任务可以用小模型（Haiku/GPT-4o-mini）做？哪些必须用大模型？
- Caching 策略？相似 prompt 的缓存命中率优化？

#### Research Area 7: Platform-Specific Content Optimization

- 每个社交媒体平台（Twitter, LinkedIn, Reddit, Instagram, TikTok, Product Hunt）的内容最佳实践是什么？
- 各平台的算法偏好是什么？（长度、格式、发布时间、互动模式）
- 有没有 research 分析不同平台上 "什么样的内容表现好"？
- 跨平台内容改写的 best practices？

#### Research Area 8: Competitive Landscape & Existing Solutions

- 深度分析这些竞品的 AI 技术方案：
  - Jasper AI（enterprise content generation）
  - Typefully（Twitter-focused AI writing）
  - Buffer AI Assistant
  - Hootsuite OwlyWriter AI
  - Lately AI（brand voice learning）
  - Sprout Social AI
  - Taplio（LinkedIn AI）
  - Tweet Hunter（Twitter growth AI）
  - ContentStudio
  - Publer AI
- 这些产品分别在 brand voice、content generation、learning、analytics 上做到了什么程度？
- 它们的明显短板是什么？Deely 可以在哪里差异化？
- 有没有用户评价/Reddit讨论/Twitter吐槽这些工具的 AI 质量？

#### Research Area 9: Evaluation Framework Design

- 怎么为一个 AI content generation 系统设计全面的 evaluation framework？
- LLM-as-judge 的方法可靠吗？怎么做 judge prompt？
- 有没有开源的 AI writing quality evaluation 工具或 benchmark？
- Human evaluation protocol 怎么设计？（标注指南、inter-annotator agreement）
- Online evaluation（A/B test with real engagement data）vs Offline evaluation（automated metrics）怎么平衡？
- 有哪些 metrics 可以自动化？哪些必须人工评估？

#### Research Area 10: Privacy, Safety & Content Moderation

- 存储用户的写作风格和内容有什么 privacy 考虑？GDPR 合规？
- AI 生成的社交媒体内容有什么安全风险？（misinformation、unintended offense、brand damage）
- 怎么设计 content guardrails 确保 AI 不生成有问题的内容？
- 用户数据隔离（multi-tenant AI）的 best practices？

---

### 输出格式要求

对每个 Research Area，请给我：

1. **Key Findings** — 最重要的发现（3-5 bullet points）
2. **Recommended Approach for Deely** — 基于 research 推荐我们怎么做
3. **Papers & Resources** — 具体的论文名、链接、开源项目
4. **Action Items** — 我们接下来应该做的具体技术决策
5. **Open Questions** — 还需要进一步调研的问题

### 注意事项

- 我更看重实际 production 经验和 case studies，而不是纯理论
- 优先找 2024-2026 的最新资料
- 如果某个领域有明确的 "industry standard" 做法，直接告诉我，不用列出所有选项
- 对于竞品分析，关注它们的 AI 技术方案而不是 pricing/UI
- 给出的推荐要考虑我们是 early stage startup，需要 ship fast，不能过度工程化

## PROMPT END
