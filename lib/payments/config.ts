// Keep this check on the server; expose only the resulting boolean to clients.
export function isPaymentsEnabled() {
  return (
    process.env.PAYMENTS_ENABLED === 'true' &&
    Boolean(process.env.STRIPE_SECRET_KEY?.trim())
  );
}

export function isStripeWebhookEnabled() {
  return (
    isPaymentsEnabled() && Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  );
}
