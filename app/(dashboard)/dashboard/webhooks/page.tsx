'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createWebhook,
  getWebhooks,
  toggleWebhook,
  deleteWebhook,
  getWebhookDeliveries,
} from '@/lib/webhooks/actions';
import { Webhook, Trash2, Power, PowerOff, Eye, Copy, Check } from 'lucide-react';
import { WebhookEventType } from '@/lib/db/schema';

interface WebhookData {
  id: number;
  name: string;
  url: string;
  events: string;
  active: number;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}

interface WebhookDelivery {
  id: number;
  eventType: string;
  responseStatus: number | null;
  attemptCount: number;
  deliveredAt: Date | null;
  createdAt: Date;
}

const AVAILABLE_EVENTS = [
  { value: WebhookEventType.USER_CREATED, label: 'User Created' },
  { value: WebhookEventType.USER_UPDATED, label: 'User Updated' },
  { value: WebhookEventType.USER_DELETED, label: 'User Deleted' },
  { value: WebhookEventType.TEAM_MEMBER_ADDED, label: 'Team Member Added' },
  { value: WebhookEventType.TEAM_MEMBER_REMOVED, label: 'Team Member Removed' },
  { value: WebhookEventType.SUBSCRIPTION_UPDATED, label: 'Subscription Updated' },
  { value: WebhookEventType.SUBSCRIPTION_CANCELLED, label: 'Subscription Cancelled' },
  { value: '*', label: 'All Events' },
];

export default function WebhooksPage() {
  const [webhooksList, setWebhooksList] = useState<WebhookData[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingDeliveries, setViewingDeliveries] = useState<number | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    const result = await getWebhooks({});
    if (result.success && result.webhooks) {
      setWebhooksList(result.webhooks as WebhookData[]);
    }
  }

  async function handleCreateWebhook() {
    if (!name || !url || selectedEvents.length === 0) return;

    setLoading(true);
    const result = await createWebhook({ name, url, events: selectedEvents });

    if (result.success && result.webhook) {
      setNewWebhookSecret(result.webhook.secret);
      setName('');
      setUrl('');
      setSelectedEvents([]);
      await loadWebhooks();
    }
    setLoading(false);
  }

  async function handleToggleWebhook(webhookId: number, active: boolean) {
    await toggleWebhook({ webhookId, active });
    await loadWebhooks();
  }

  async function handleDeleteWebhook(webhookId: number) {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    await deleteWebhook({ webhookId });
    await loadWebhooks();
  }

  async function viewDeliveries(webhookId: number) {
    setViewingDeliveries(webhookId);
    const result = await getWebhookDeliveries({ webhookId });
    if (result.success && result.deliveries) {
      setDeliveries(result.deliveries as WebhookDelivery[]);
    }
  }

  function toggleEvent(event: string) {
    if (event === '*') {
      setSelectedEvents(selectedEvents.includes('*') ? [] : ['*']);
    } else {
      if (selectedEvents.includes('*')) {
        setSelectedEvents([event]);
      } else {
        setSelectedEvents(
          selectedEvents.includes(event)
            ? selectedEvents.filter((e) => e !== event)
            : [...selectedEvents, event]
        );
      }
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  function formatDate(date: Date | null) {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <p className="text-muted-foreground mt-2">
          Configure webhooks to receive real-time notifications about events.
        </p>
      </div>

      {newWebhookSecret && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Webhook Created!</CardTitle>
            <CardDescription className="text-green-700">
              Make sure to copy your webhook secret now. You won't be able to see it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-4 py-2 text-sm font-mono border">
                {newWebhookSecret}
              </code>
              <Button
                onClick={() => copyToClipboard(newWebhookSecret)}
                variant="outline"
                size="sm"
              >
                {copiedSecret ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={() => setNewWebhookSecret(null)}
              className="mt-4"
              variant="outline"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Webhook</CardTitle>
          <CardDescription>
            Set up a new webhook endpoint to receive event notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Webhook Name</Label>
            <Input
              id="name"
              placeholder="Production Webhook"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="url">Endpoint URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://api.example.com/webhooks"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <Label>Events to Subscribe</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedEvents.includes('*')
                        ? event.value === '*'
                        : selectedEvents.includes(event.value)
                    }
                    onChange={() => toggleEvent(event.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>
          <Button
            onClick={handleCreateWebhook}
            disabled={!name || !url || selectedEvents.length === 0 || loading}
          >
            <Webhook className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Webhooks</CardTitle>
          <CardDescription>
            {webhooksList.length === 0
              ? 'No webhooks configured yet.'
              : `You have ${webhooksList.length} webhook${webhooksList.length === 1 ? '' : 's'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooksList.map((webhook) => {
              const events = JSON.parse(webhook.events) as string[];
              return (
                <div
                  key={webhook.id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{webhook.name}</span>
                        {webhook.active ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <div>{webhook.url}</div>
                        <div>Events: {events.join(', ')}</div>
                        <div>Last triggered: {formatDate(webhook.lastTriggeredAt)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => viewDeliveries(webhook.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleToggleWebhook(webhook.id, !webhook.active)}
                        variant="outline"
                        size="sm"
                      >
                        {webhook.active ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {viewingDeliveries === webhook.id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Recent Deliveries</h4>
                      {deliveries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No deliveries yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {deliveries.map((delivery) => (
                            <div
                              key={delivery.id}
                              className="text-sm p-2 bg-gray-50 rounded"
                            >
                              <div className="flex justify-between">
                                <span>{delivery.eventType}</span>
                                <span
                                  className={
                                    delivery.responseStatus === 200
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }
                                >
                                  {delivery.responseStatus || 'Failed'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(delivery.createdAt)} • Attempt{' '}
                                {delivery.attemptCount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={() => setViewingDeliveries(null)}
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
