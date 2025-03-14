'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers } from '@/lib/db/schema';

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>

      {/* Subscription Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">
                  Current Plan: {teamData.planName || 'Free'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {teamData.subscriptionStatus === 'active'
                    ? 'Billed monthly'
                    : teamData.subscriptionStatus === 'trialing'
                    ? 'Trial period'
                    : 'No active subscription'}
                </p>
              </div>
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Manage Subscription
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Table (sortable + paginated) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Portfolio View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-2 py-3 font-medium">Asset</th>
                  <th className="text-right px-2 py-3 font-medium">Market Price</th>
                  <th className="text-right px-2 py-3 font-medium">Average Price</th>
                  <th className="text-right px-2 py-3 font-medium">Amount</th>
                  <th className="text-right px-2 py-3 font-medium">Market Value</th>
                  <th className="text-right px-2 py-3 font-medium">ROI (%)</th>
                </tr>
              </thead>
              <tbody>
                {portPageData.map((asset) => {
                  const marketValue = asset.marketPrice * asset.amount;
                  const roi =
                    ((asset.marketPrice - asset.avgPrice) / asset.avgPrice) * 100;
                  return (
                    <tr key={asset.symbol} className="border-b hover:bg-muted/50">
                      <td className="px-2 py-3 font-medium">{asset.symbol}</td>
                      <td className="text-right px-2 py-3">
                        ${asset.marketPrice.toFixed(2)}
                      </td>
                      <td className="text-right px-2 py-3">
                        ${asset.avgPrice.toFixed(2)}
                      </td>
                      <td className="text-right px-2 py-3">{asset.amount}</td>
                      <td className="text-right px-2 py-3">${marketValue.toFixed(2)}</td>
                      <td className={`text-right px-2 py-3 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="px-2 py-3 text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination controls for Portfolio */}
          <div className="flex items-center mt-4 gap-2">
            <Button
              variant="outline"
              disabled={portPage === 0}
              onClick={handlePortPrev}
            >
              Prev
            </Button>
            <p className="text-sm">
              Page {portPage + 1} of {totalPortPages}
            </p>
            <Button
              variant="outline"
              disabled={portPage === totalPortPages - 1}
              onClick={handlePortNext}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Priority List Table (DnD) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Priority List View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
        <tr className="border-b">
          <th className="text-left px-2 py-3 font-medium">Ticker</th>
          <th className="text-left px-2 py-3 font-medium">Priority</th>
        </tr>
          </thead>
          <tbody>
        {[
          { ticker: 'JPM', priority: 1 },
          { ticker: 'GS', priority: 2 },
          { ticker: 'SPY', priority: 3 },
          { ticker: 'BTC-USD', priority: 4 },
          { ticker: 'TGT', priority: 5 },
        ].map((item) => (
          <tr key={item.ticker} className="border-b hover:bg-muted/50">
        <td className="px-2 py-3">{item.ticker}</td>
        <td className="px-2 py-3">{item.priority}</td>
          </tr>
        ))}
          </tbody>
        </table>
          </div>
          <Button variant="outline" className="p-4 mt-4">Update Priorities</Button>
        </CardContent>
      </Card>
    </section>
  );
}
