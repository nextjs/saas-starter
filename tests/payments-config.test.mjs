import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import {
  isPaymentsEnabled,
  isStripeWebhookEnabled
} from '../lib/payments/config.ts';

const names = ['PAYMENTS_ENABLED', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
let original;

beforeEach(() => {
  original = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  for (const name of names) delete process.env[name];
});

afterEach(() => {
  for (const name of names) {
    if (original[name] === undefined) delete process.env[name];
    else process.env[name] = original[name];
  }
});

test('payments and webhooks are disabled by default without credentials', () => {
  assert.equal(isPaymentsEnabled(), false);
  assert.equal(isStripeWebhookEnabled(), false);
});

test('an explicit opt-in cannot enable payments without credentials', () => {
  process.env.PAYMENTS_ENABLED = 'true';
  assert.equal(isPaymentsEnabled(), false);
  assert.equal(isStripeWebhookEnabled(), false);
});

test('an explicit opt-out keeps payments and webhooks disabled', () => {
  process.env.PAYMENTS_ENABLED = 'false';
  assert.equal(isPaymentsEnabled(), false);
  assert.equal(isStripeWebhookEnabled(), false);
});
