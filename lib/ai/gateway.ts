/**
 * AI Gateway for Vercel Configuration
 *
 * This utility provides a pre-configured base for AI SDK operations
 * routed through Vercel's AI Gateway.
 *
 * Usage with Vercel AI SDK:
 *
 * const openai = createOpenAI({
 *   baseURL: getAiGatewayUrl('openai'),
 *   headers: {
 *     'x-vercel-ai-gateway-id': process.env.VERCEL_AI_GATEWAY_ID,
 *   },
 * });
 */

export const getAiGatewayUrl = (provider: 'openai' | 'anthropic') => {
  const gatewayId = process.env.VERCEL_AI_GATEWAY_ID;

  if (!gatewayId) {
    // Fallback to direct provider if gateway is not configured
    return undefined;
  }

  // Standard Vercel AI Gateway URL pattern
  return `https://gateway.ai.vercel.app/v1`;
};

export const aiConfig = {
  gatewayId: process.env.VERCEL_AI_GATEWAY_ID,
  isConfigured: !!process.env.VERCEL_AI_GATEWAY_ID,
};
