// Line AI Configuration for AI SaaS Template
module.exports = {
  name: "AI SaaS Template",
  type: "ai_saas",
  version: "1.0.0",

  // Deployment configuration
  deployment: {
    // Platform: Vercel
    platform: "vercel",

    // Type: custom (creates new Vercel project per deployment)
    type: "custom",

    // Custom deployment settings
    custom: {
      vercel: {
        framework: "nextjs",
        buildCommand: "pnpm build",
        outputDirectory: ".next",
        nodeVersion: "20.x",
      }
    },

    // DNS handling strategy
    dns: {
      // Use Vercel Domain API to add subdomain to Vercel project
      strategy: "vercel-domain",

      // Dynamic reference - project ID captured from deployment
      vercelProjectId: "${vercel.projectId}"
    }
  },

  // Framework configuration
  framework: "nextjs",
  buildCommand: "pnpm build",
  outputDirectory: ".next",

  // Required environment variables
  environmentVariables: [
    "DATABASE_URL",
    "AUTH_SECRET",
    "OPENAI_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "REDIS_URL"
  ],

  // Available services
  services: [
    "ai-models",
    "payments",
    "analytics",
    "rate-limiting",
    "usage-tracking"
  ],

  // Customization options
  customizationOptions: {
    appName: {
      type: "string",
      default: "My AI App"
    },
    aiModel: {
      type: "select",
      options: ["gpt-4", "gpt-3.5-turbo", "claude-3"],
      default: "gpt-4"
    },
    features: {
      type: "multiselect",
      options: ["api-access", "embeddings", "fine-tuning", "assistants"],
      default: ["api-access"]
    },
    theme: {
      type: "select",
      options: ["light", "dark", "auto"],
      default: "light"
    }
  }
};
