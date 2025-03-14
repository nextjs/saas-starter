'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { TeamDataWithMembers } from '@/lib/db/schema';

// We'll remove Chart.js and the Pie import, since we no longer use them.

const ITEMS_PER_PAGE = 5;

// Helper to create a 7x24 zeroed matrix
function createDayHourMatrix(): number[][] {
  // dayHourMatrix[dayOfWeek][hour]
  return Array.from({ length: 7 }, () => Array(24).fill(0));
}

// Simple helper to color cells by count
function getColorByCount(count: number): string {
  // E.g. a basic approach: no triggers -> #eee, more triggers -> darker shade of green
  if (count === 0) return '#eee';
  // Scale or clamp if needed
  const intensity = Math.min(count, 10); // cap at 10
  // We'll do a light green to dark green
  // For instance, lighten => f0fff0, dark => #006400
  // This is approximate for demonstration:
  const greenBase = 100 - intensity * 7; // from 100 down
  return `hsl(120, 50%, ${greenBase}%)`; // 120 is green hue
}

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  /*******************************************************
   * EXAMPLE AUTOMATION DATA + PAGINATION SETUP
   *******************************************************/
  const allAutomationData = [
    { ticker: 'JPM', time: '2023-10-01 10:00', amount: 10, purchaseType: 'shares' },
    { ticker: 'GS', time: '2023-10-02 11:00', amount: 5, purchaseType: 'dollars' },
    { ticker: 'SPY', time: '2023-10-03 12:00', amount: 2, purchaseType: 'percent' },
    { ticker: 'BTC-USD', time: '2023-10-04 13:00', amount: 0.1, purchaseType: 'shares' },
    { ticker: 'TGT', time: '2023-10-05 14:00', amount: 20, purchaseType: 'shares' },
    { ticker: 'AAPL', time: '2023-10-06 09:00', amount: 5, purchaseType: 'dollars' },
    { ticker: 'TSLA', time: '2023-10-07 10:30', amount: 2, purchaseType: 'shares' },
    { ticker: 'META', time: '2023-10-07 11:00', amount: 12, purchaseType: 'percent' },
    { ticker: 'GOOG', time: '2023-10-08 09:45', amount: 10, purchaseType: 'dollars' },
    { ticker: 'AMZN', time: '2023-10-08 11:15', amount: 3, purchaseType: 'shares' },
    { ticker: 'MSFT', time: '2023-10-09 14:00', amount: 6, purchaseType: 'percent' },
    { ticker: 'NVDA', time: '2023-10-09 14:30', amount: 4, purchaseType: 'shares' },
  ];

  // Pagination state
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(allAutomationData.length / ITEMS_PER_PAGE);

  // Current slice of data
  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = allAutomationData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };
  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  /*******************************************************
   * DAY/TIME HEATMAP
   *******************************************************/

  // Build dayHourMatrix from allAutomationData
  // dayOfWeek: 0=Sun, 1=Mon, ... 6=Sat
  // hour: 0..23
  const dayHourMatrix = useMemo(() => {
    const matrix = createDayHourMatrix();
    allAutomationData.forEach((item) => {
      const date = new Date(item.time);
      const day = date.getDay(); // 0..6
      const hour = date.getHours(); // 0..23
      matrix[day][hour] += 1;
    });
    return matrix;
  }, [allAutomationData]);

  // We'll label each row: Sunday...Saturday
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // We'll label each column as 0..23 or "12 AM," "1 AM," etc. 
  // For brevity, let's just do numeric 0..23
  const hourLabels = Array.from({ length: 24 }, (_, i) => i);

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

      {/* Portfolio View with Data Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Asset</th>
                  <th className="text-right px-2 py-3 font-semibold uppercase text-sm">Market Price</th>
                  <th className="text-right px-2 py-3 font-semibold uppercase text-sm">Average Price</th>
                  <th className="text-right px-2 py-3 font-semibold uppercase text-sm">Amount</th>
                  <th className="text-right px-2 py-3 font-semibold uppercase text-sm">Market Value</th>
                  <th className="text-right px-2 py-3 font-semibold uppercase text-sm">ROI (%)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { symbol: 'JPM', marketPrice: 183.27, avgPrice: 160.45, amount: 15 },
                  { symbol: 'GS', marketPrice: 452.68, avgPrice: 410.21, amount: 8 },
                  { symbol: 'SPY', marketPrice: 529.42, avgPrice: 480.30, amount: 20 },
                  { symbol: 'BTC-USD', marketPrice: 63241.75, avgPrice: 48750.30, amount: 0.5 },
                  { symbol: 'TGT', marketPrice: 156.78, avgPrice: 170.25, amount: 25 },
                ].map((asset) => {
                  const marketValue = asset.marketPrice * asset.amount;
                  const roi = ((asset.marketPrice - asset.avgPrice) / asset.avgPrice) * 100;
                  return (
                    <tr key={asset.symbol} className="border-b hover:bg-muted/50">
                      <td className="px-2 py-3 font-medium">{asset.symbol}</td>
                      <td className="text-right px-2 py-3">${asset.marketPrice.toFixed(2)}</td>
                      <td className="text-right px-2 py-3">${asset.avgPrice.toFixed(2)}</td>
                      <td className="text-right px-2 py-3">{asset.amount}</td>
                      <td className="text-right px-2 py-3">${marketValue.toFixed(2)}</td>
                      <td
                        className={`text-right px-2 py-3 ${
                          roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
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
        </CardContent>
      </Card>

      {/* Priority List Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Asset Priority List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Ticker</th>
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Priority</th>
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
          <Button variant="outline" className="p-4 mt-4">
            Update Priorities
          </Button>
        </CardContent>
      </Card>

      {/* Automation Table Card (with pagination) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Automation History Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Ticker</th>
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Time</th>
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Amount</th>
                  <th className="text-left px-2 py-3 font-semibold uppercase text-sm">Type</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="px-2 py-3">{item.ticker}</td>
                    <td className="px-2 py-3">{item.time}</td>
                    <td className="px-2 py-3">{item.amount}</td>
                    <td className="px-2 py-3">{item.purchaseType}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div className="flex items-center mt-4 gap-2">
              <Button variant="outline" disabled={page === 0} onClick={handlePrevPage}>
                Prev
              </Button>
              <p className="text-sm">
                Page {page + 1} of {totalPages}
              </p>
              <Button variant="outline" disabled={page === totalPages - 1} onClick={handleNextPage}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day/Time Heatmap Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Automation Execution Heatmap (Day vs. Hour)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* We'll use a table to visualize the 7x24 dayHourMatrix */}
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-sm"></th>
                  {/* Hour labels across the top */}
                  {hourLabels.map((hour) => (
                    <th key={hour} className="p-1 text-xs text-center font-semibold">
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayHourMatrix.map((row, dayIndex) => (
                  <tr key={dayIndex}>
                    {/* Day label in first column */}
                    <td className="p-1 text-xs font-medium">{dayLabels[dayIndex]}</td>
                    {row.map((count, hourIndex) => (
                      <td
                        key={hourIndex}
                        className="p-1 text-center align-middle"
                        style={{
                          backgroundColor: getColorByCount(count),
                          width: '24px',
                          height: '24px',
                          minWidth: '24px',
                        }}
                        title={`Day: ${dayLabels[dayIndex]}, Hour: ${hourIndex}, Count: ${count}`}
                      >
                        {/* Could show the count or keep blank */}
                        {count > 0 ? count : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
