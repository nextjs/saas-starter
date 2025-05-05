# 项目API文档

本文档提供了项目中所有API端点的详细说明，包括它们的功能、参数和返回值。

## 目录

1. [活动日志API](#活动日志api)
2. [API密钥管理](#api密钥管理)
3. [订阅计划API](#订阅计划api)
4. [Stripe支付集成](#stripe支付集成)
5. [团队管理API](#团队管理api)
6. [用户管理API](#用户管理api)

## 活动日志API

### GET /api/activity

获取系统活动日志，支持分页、筛选和搜索功能。

**查询参数:**
- `page`: 页码，默认为1
- `limit`: 每页记录数，默认为10
- `action`: 活动类型筛选
- `startDate`: 开始日期筛选
- `endDate`: 结束日期筛选
- `search`: 关键词搜索

**返回值:**
- 活动日志列表

**权限要求:**
- 需要用户登录

### POST /api/activity

创建新的活动日志记录。

**请求体:**
- `action`: 活动类型（必填）
- `ipAddress`: IP地址

**返回值:**
- 成功: `{ success: true }`
- 失败: 错误信息

**权限要求:**
- 需要用户登录
- 用户必须属于某个团队

## API密钥管理

### GET /api/api-keys

获取当前用户团队的所有API密钥。

**返回值:**
- API密钥列表，密钥值被部分隐藏，只显示前缀和后6位

**权限要求:**
- 需要用户登录
- 用户必须属于某个团队

### POST /api/api-keys

创建新的API密钥。

**请求体:**
- `name`: 密钥名称（必填）
- `permissions`: 权限列表，默认为 `['read']`
- `expiresAt`: 过期时间（可选）

**返回值:**
- 新创建的API密钥信息

**权限要求:**
- 需要用户登录
- 用户必须属于某个团队

### DELETE /api/api-keys/[id]

撤销（软删除）指定的API密钥。

**路径参数:**
- `id`: API密钥ID

**返回值:**
- 成功: `{ success: true }`
- 失败: 错误信息

**权限要求:**
- 需要用户登录
- 用户必须属于某个团队
- 密钥必须属于用户的团队

## 订阅计划API

### GET /api/plans

获取所有可用的订阅计划。

**返回值:**
- 订阅计划列表

## Stripe支付集成

### GET /api/stripe/checkout

处理Stripe结账成功后的回调，更新用户的订阅信息。

**查询参数:**
- `session_id`: Stripe会话ID（必填）

**处理流程:**
1. 从Stripe获取结账会话详情
2. 提取客户ID、订阅ID和产品信息
3. 更新用户团队的订阅信息
4. 设置用户会话
5. 重定向到仪表板

**错误处理:**
- 如果处理失败，重定向到错误页面

### POST /api/stripe/webhook

处理来自Stripe的webhook事件，主要处理订阅相关的事件。

**支持的事件类型:**
- `customer.subscription.updated`: 订阅更新事件
- `customer.subscription.deleted`: 订阅删除事件

**安全验证:**
- 使用Stripe签名验证请求的真实性

**返回值:**
- 成功: `{ received: true }`
- 验证失败: 400状态码和错误信息

## 团队管理API

### GET /api/team

获取当前登录用户所属的团队信息。

**返回值:**
- 用户所属团队的详细信息

## 用户管理API

### GET /api/user

获取当前登录用户的信息。

**返回值:**
- 当前用户的详细信息

## 技术实现细节

### 认证与授权

大多数API端点都需要用户登录才能访问。认证通过 `getUser()` 函数实现，该函数从会话中获取当前用户信息。

### 错误处理

API端点使用try-catch块捕获异常，并返回适当的HTTP状态码和错误消息。常见的错误处理包括：
- 401 Unauthorized: 用户未登录
- 404 Not Found: 请求的资源不存在
- 400 Bad Request: 请求参数无效
- 500 Internal Server Error: 服务器内部错误

### 数据库交互

API使用Drizzle ORM进行数据库操作，主要通过以下方式：
- 直接使用db对象执行查询
- 使用预定义的查询函数（如getUser、getTeamForUser等）

### 活动日志

系统使用活动日志记录重要操作，如创建API密钥、撤销API密钥等。活动日志通过 `logActivity()` 函数实现。

### Stripe集成

项目集成了Stripe支付系统，包括：
- 结账流程
- 订阅管理
- Webhook事件处理
