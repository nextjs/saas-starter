/**
 * Feature flags system for enabling/disabling features dynamically
 */

export enum FeatureFlag {
  WEBHOOKS = 'webhooks',
  API_KEYS = 'api_keys',
  FILE_UPLOADS = 'file_uploads',
  ANALYTICS = 'analytics',
  ADVANCED_BILLING = 'advanced_billing',
  TWO_FACTOR_AUTH = '2fa',
  TEAM_COLLABORATION = 'team_collaboration',
  CUSTOM_DOMAINS = 'custom_domains',
}

// Default feature flags configuration
// In production, this would be stored in a database or configuration service
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.WEBHOOKS]: true,
  [FeatureFlag.API_KEYS]: true,
  [FeatureFlag.FILE_UPLOADS]: true,
  [FeatureFlag.ANALYTICS]: true,
  [FeatureFlag.ADVANCED_BILLING]: true,
  [FeatureFlag.TWO_FACTOR_AUTH]: false, // Coming soon
  [FeatureFlag.TEAM_COLLABORATION]: true,
  [FeatureFlag.CUSTOM_DOMAINS]: false, // Premium feature
};

// Plan-based feature access
const PLAN_FEATURES: Record<string, FeatureFlag[]> = {
  free: [
    FeatureFlag.TEAM_COLLABORATION,
    FeatureFlag.ANALYTICS,
  ],
  base: [
    FeatureFlag.TEAM_COLLABORATION,
    FeatureFlag.ANALYTICS,
    FeatureFlag.WEBHOOKS,
    FeatureFlag.API_KEYS,
  ],
  plus: [
    FeatureFlag.TEAM_COLLABORATION,
    FeatureFlag.ANALYTICS,
    FeatureFlag.WEBHOOKS,
    FeatureFlag.API_KEYS,
    FeatureFlag.FILE_UPLOADS,
    FeatureFlag.ADVANCED_BILLING,
    FeatureFlag.CUSTOM_DOMAINS,
  ],
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return DEFAULT_FLAGS[flag] || false;
}

export function isFeatureEnabledForPlan(
  flag: FeatureFlag,
  planName: string | null
): boolean {
  if (!planName) {
    return PLAN_FEATURES.free.includes(flag);
  }

  const normalizedPlan = planName.toLowerCase();
  const features = PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free;

  return features.includes(flag) && isFeatureEnabled(flag);
}

export function getFeaturesForPlan(planName: string | null): FeatureFlag[] {
  if (!planName) {
    return PLAN_FEATURES.free;
  }

  const normalizedPlan = planName.toLowerCase();
  return PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free;
}

export function getAllFeatures(): Record<FeatureFlag, boolean> {
  return { ...DEFAULT_FLAGS };
}
