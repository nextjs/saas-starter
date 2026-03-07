'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const platforms = [
  { id: 'twitter', name: 'Twitter / X', connected: true, handle: '@lekro', permissions: ['read', 'write', 'dm'] },
  { id: 'linkedin', name: 'LinkedIn', connected: true, handle: 'Alex K.', permissions: ['read', 'write'] },
  { id: 'instagram', name: 'Instagram', connected: false, handle: null, permissions: [] },
  { id: 'reddit', name: 'Reddit', connected: true, handle: 'u/lekro', permissions: ['read', 'write'] },
  { id: 'producthunt', name: 'Product Hunt', connected: false, handle: null, permissions: [] },
  { id: 'tiktok', name: 'TikTok', connected: false, handle: null, permissions: [] },
];

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  linkedin: 'in',
  instagram: 'IG',
  reddit: 'r/',
  producthunt: 'PH',
  tiktok: 'TT',
};

export function AccountTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Connected Platforms</h3>
        <p className="text-sm text-muted-foreground">
          Manage your social media platform connections.
        </p>
      </div>
      <Separator />
      <div className="grid gap-3">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-sm">
                {platformIcons[platform.id]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{platform.name}</span>
                  <Badge variant={platform.connected ? 'default' : 'secondary'}>
                    {platform.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                {platform.connected && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {platform.handle}
                    {platform.permissions.length > 0 && (
                      <span className="ml-2">
                        Permissions: {platform.permissions.join(', ')}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Button
                variant={platform.connected ? 'outline' : 'default'}
                size="sm"
              >
                {platform.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
