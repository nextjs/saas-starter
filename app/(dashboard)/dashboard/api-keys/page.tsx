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
import { createApiKey, getApiKeys, revokeApiKey } from '@/lib/api-keys/actions';
import { Key, Trash2, Copy, Check } from 'lucide-react';

interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    const result = await getApiKeys({});
    if (result.success && result.keys) {
      setKeys(result.keys as ApiKey[]);
    }
  }

  async function handleCreateKey() {
    if (!name) return;

    setLoading(true);
    const result = await createApiKey({
      name,
      expiresInDays: expiresInDays === '' ? undefined : expiresInDays,
    });

    if (result.success && result.key) {
      setNewKey(result.key);
      setName('');
      setExpiresInDays('');
      await loadKeys();
    }
    setLoading(false);
  }

  async function handleRevokeKey(keyId: number) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    const result = await revokeApiKey({ keyId });
    if (result.success) {
      await loadKeys();
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function formatDate(date: Date | null) {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage API keys for programmatic access to your resources.
        </p>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">API Key Created!</CardTitle>
            <CardDescription className="text-green-700">
              Make sure to copy your API key now. You won't be able to see it again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-4 py-2 text-sm font-mono border">
                {newKey}
              </code>
              <Button
                onClick={() => copyToClipboard(newKey)}
                variant="outline"
                size="sm"
              >
                {copiedKey ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={() => setNewKey(null)}
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
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for accessing your resources programmatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Key Name</Label>
            <Input
              id="name"
              placeholder="Production Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="expires">Expires In (days)</Label>
            <Input
              id="expires"
              type="number"
              placeholder="Never (leave empty)"
              value={expiresInDays}
              onChange={(e) =>
                setExpiresInDays(e.target.value === '' ? '' : parseInt(e.target.value))
              }
              min="0"
              max="365"
            />
          </div>
          <Button onClick={handleCreateKey} disabled={!name || loading}>
            <Key className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>
            {keys.length === 0
              ? 'No API keys found. Create one to get started.'
              : `You have ${keys.length} active API key${keys.length === 1 ? '' : 's'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{key.name}</span>
                    <code className="text-xs text-muted-foreground">
                      sk_{key.keyPrefix}_***
                    </code>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Created: {formatDate(key.createdAt)} • Last used:{' '}
                    {formatDate(key.lastUsedAt)}
                    {key.expiresAt && ` • Expires: ${formatDate(key.expiresAt)}`}
                  </div>
                </div>
                <Button
                  onClick={() => handleRevokeKey(key.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
