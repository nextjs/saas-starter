'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { notificationPreferences } from '@/lib/mock-data';
import type { NotificationPreference } from '@/lib/types';

export function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>(
    notificationPreferences.map((p) => ({ ...p }))
  );

  function toggle(index: number, channel: 'inApp' | 'push' | 'email') {
    const updated = [...prefs];
    updated[index] = { ...updated[index], [channel]: !updated[index][channel] };
    setPrefs(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified for each event type.
        </p>
      </div>
      <Separator />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3 pr-4 text-left font-medium">Notification Type</th>
              <th className="px-4 py-3 text-center font-medium">In-app</th>
              <th className="px-4 py-3 text-center font-medium">Push</th>
              <th className="px-4 py-3 text-center font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {prefs.map((pref, i) => (
              <tr key={pref.type} className="border-b last:border-b-0">
                <td className="py-3 pr-4 text-sm">{pref.label}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.inApp}
                      onCheckedChange={() => toggle(i, 'inApp')}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.push}
                      onCheckedChange={() => toggle(i, 'push')}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.email}
                      onCheckedChange={() => toggle(i, 'email')}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
