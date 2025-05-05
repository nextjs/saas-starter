# components目录说明

本文档提供了项目components目录中主要组件的详细说明。

## 核心组件

### Header.tsx
网站头部组件，包含网站标志、导航菜单、用户菜单和主题切换按钮。支持响应式设计，在移动设备上显示汉堡菜单。

**主要功能：**
- 显示网站标志和名称
- 提供主导航菜单
- 集成用户菜单（登录状态和未登录状态）
- 集成主题切换按钮
- 响应式设计，在移动设备上显示汉堡菜单

### Footer.tsx
网站页脚组件，包含版权信息和重要链接。支持响应式设计。

**主要功能：**
- 显示版权信息
- 提供重要链接（条款、隐私政策、联系方式）
- 响应式设计，在小屏幕上垂直排列

### theme-provider.tsx
主题提供者组件，使用next-themes库为应用提供主题支持。

**主要功能：**
- 包装next-themes的ThemeProvider
- 为整个应用提供主题上下文
- 支持亮色、暗色和系统主题

### theme-toggle.tsx
主题切换组件，提供一个下拉菜单，允许用户在亮色、暗色和系统主题之间切换。

**主要功能：**
- 提供主题切换按钮
- 按钮图标根据当前主题动态变化
- 下拉菜单提供三种主题选项

## UI组件库

components/ui目录包含了一系列基础UI组件，这些组件基于shadcn/ui构建，提供了一致的设计语言和主题支持。

主要组件包括：

- **button.tsx**: 按钮组件，支持多种变体和尺寸
- **avatar.tsx**: 头像组件，支持图片和文字回退
- **dropdown-menu.tsx**: 下拉菜单组件，用于创建上下文菜单
- **form.tsx**: 表单组件，提供表单验证和状态管理
- **input.tsx**: 输入框组件
- **card.tsx**: 卡片组件，用于内容分组
- **dialog.tsx**: 对话框组件，用于模态交互
- **toast.tsx**: 提示消息组件
- 等等

## 业务组件

### UserMenu
用户菜单组件，显示用户头像和下拉菜单，包含仪表板链接和登出选项。未登录时显示"Getting Started"按钮。

**主要功能：**
- 显示用户头像（如果已登录）
- 提供仪表板链接
- 提供登出功能
- 未登录时显示登录按钮

### 仪表板组件

components/dashboard目录包含仪表板相关组件：

- **activity-log.tsx**: 活动日志组件，显示用户活动历史
- **api-keys.tsx**: API密钥管理组件
- **team-members.tsx**: 团队成员管理组件
- **subscription.tsx**: 订阅管理组件

### 营销组件

components/marketing目录包含营销相关组件：

- **pricing.tsx**: 定价表组件，显示不同订阅计划
- **features.tsx**: 功能展示组件
- **testimonials.tsx**: 用户评价组件
- **cta.tsx**: 号召性用语组件

## 组件设计原则

1. **组件化**: 将UI拆分为可重用的独立组件
2. **响应式**: 所有组件都支持响应式设计，适应不同屏幕尺寸
3. **主题支持**: 组件支持亮色和暗色主题
4. **可访问性**: 组件遵循Web内容可访问性指南(WCAG)
5. **类型安全**: 使用TypeScript确保类型安全

## 组件使用指南

1. 导入所需组件
2. 根据需要配置组件属性
3. 在JSX中使用组件
4. 使用Tailwind CSS进行样式调整

示例：
```tsx
import { Button } from "@/components/ui/button";

export function MyComponent() {
  return (
    <Button variant="default" size="lg" onClick={() => console.log("Clicked!")}>
      点击我
    </Button>
  );
}
```
