import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

// Run against a local production build with payments disabled and both keys absent.
const baseUrl = process.env.TEST_BASE_URL;

test('disabled checkout rejects requests including supplied session IDs', {
  skip: !baseUrl
}, async () => {
  for (const path of [
    '/api/stripe/checkout',
    '/api/stripe/checkout?session_id=disabled-payment-check'
  ]) {
    const response = await fetch(new URL(path, baseUrl), { redirect: 'manual' });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Payments are disabled.' });
    assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('disabled webhook rejects events before parsing or processing them', {
  skip: !baseUrl
}, async () => {
  for (const body of [
    'malformed request',
    JSON.stringify({ type: 'customer.subscription.updated', data: { object: {} } })
  ]) {
    const response = await fetch(new URL('/api/stripe/webhook', baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Payments are disabled.' });
  }
});

test('pricing renders the unavailable state without a checkout form', {
  skip: !baseUrl
}, async () => {
  const response = await fetch(new URL('/pricing', baseUrl));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Payments are unavailable/);
  assert.doesNotMatch(html, /name="priceId"/);
});

test('direct checkout and portal server actions cannot bypass disabled payments', {
  skip: !baseUrl
}, async () => {
  // Use the current build's action IDs and React's wire encoding rather than
  // relying on hidden buttons to protect these publicly callable actions.
  const manifest = JSON.parse(await readFile(
    new URL('../.next/server/server-reference-manifest.json', import.meta.url),
    'utf8'
  ));
  const require = createRequire(import.meta.url);
  const { encodeReply } = require('next/dist/compiled/react-server-dom-turbopack/client.node');

  for (const name of ['checkoutAction', 'customerPortalAction']) {
    const entry = Object.entries(manifest.node).find(([, action]) => action.exportedName === name);
    assert.ok(entry, `${name} must be included in the current build`);
    const body = await encodeReply([new FormData()]);
    const headers = { 'Next-Action': entry[0], Origin: new URL(baseUrl).origin };
    if (typeof body === 'string') headers['Content-Type'] = 'text/plain;charset=UTF-8';
    const response = await fetch(new URL('/pricing', baseUrl), {
      method: 'POST', headers, body, redirect: 'manual'
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('x-action-redirect'), '/pricing;push');
    assert.equal(response.headers.get('set-cookie'), null);
  }
});
