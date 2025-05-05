import { Key, ChartLine } from "lucide-react";

/**
 * 网站基本信息
 */
export const SITE = {
  // 网站名称
  NAME: 'MCP.Day',
  // 网站URL
  URL: 'https://mcp.day',
  // 版权年份
  COPYRIGHT_YEAR: new Date().getFullYear(),
};

/**
 * 社交媒体链接
 */
export const SOCIAL = {
  GITHUB: 'https://github.com/Anson2Dev/mcp-saas-kit',
  TWITTER: 'https://twitter.com/mcpday',
  DISCORD: 'https://discord.gg/mcpday',
  WECHAT: 'mcpday',
};

/**
 * 联系信息
 */
export const CONTACT = {
  EMAIL: 'contact@mcp.day',
  SUPPORT: 'support@mcp.day',
};

/**
 * 导航链接
 */
export const NAVIGATION = {
  MAIN: [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Docs', href: '/docs' },
    { name: 'Blog', href: '/blog' },
  ],
  FOOTER: [
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Contact', href: '/contact' },
  ],
    navMain: [
      {
        title: "MCP playground",
        url: "#",
        icon: Key,
        items: [
          {
            title: "Try our MCP",
            url: "/dashboard/playground",
          }
        ],
      },
      {
      title: "API Keys",
      url: "#",
      icon: Key,
      items: [
        {
          title: "Manage Keys",
          url: "/dashboard/apikeys",
        }
      ],
    },
    {
      title: "Usage",
      url: "#",
      icon: ChartLine,
      items: [
        {
          title: "History",
          url: "#",
        },
      ],
    },
  ],
};

/**
 * Plans
 */
export const PLANS = [
  {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '1000 API calls',
      '10 API keys',
      '10 team members',
    ],
  },
  {
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    features: [
      '10,000 API calls',
      '100 API keys',
      '100 team members',
    ],
  },
];

/**
 * API_PREFIX 不能超过3个字符
 */
export const API_PREFIX = 'mdy';

/**
 * MCP配置示例
 */
export const MCP_CONFIG_EXAMPLE = `{
  "mcpServers": {
    "mcp-hello-world": {
      "command": "npx",
      "args": [
        "mcp-hello-world",
        "--api-key=your-hello-world-api-key"
      ]
    }
  }
}`;