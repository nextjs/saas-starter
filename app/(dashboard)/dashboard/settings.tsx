'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { TeamDataWithMembers } from '@/lib/db/schema';

// Helper to create a 7x24 zeroed matrix
function createDayHourMatrix(): number[][] {
  // dayHourMatrix[dayOfWeek][hour]
  return Array.from({ length: 7 }, () => Array(24).fill(0));
}

// Simple helper to color cells by count for the Heatmap
function getColorByCount(count: number): string {
  // Just a simple gradient from #eee to dark green
  if (count === 0) return '#eee';
  const intensity = Math.min(count, 10);
  const greenBase = 100 - intensity * 7; // from 100 down
  return `hsl(120, 50%, ${greenBase}%)`; // 120 is green hue
}

const ITEMS_PER_PAGE = 10;

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  /*******************************************************
   * EXAMPLE PORTFOLIO DATA
   *******************************************************/
  const initialPortfolioData = [
    { symbol: 'JPM', marketPrice: 183.27, avgPrice: 160.45, amount: 15 },
    { symbol: 'GS', marketPrice: 452.68, avgPrice: 410.21, amount: 8 },
    { symbol: 'SPY', marketPrice: 529.42, avgPrice: 480.3, amount: 20 },
    { symbol: 'BTC-USD', marketPrice: 63241.75, avgPrice: 48750.3, amount: 0.5 },
    { symbol: 'TGT', marketPrice: 156.78, avgPrice: 170.25, amount: 25 },
    { symbol: 'AAPL', marketPrice: 175.05, avgPrice: 182.0, amount: 10 },
    { symbol: 'TSLA', marketPrice: 250.0, avgPrice: 210.4, amount: 8 },
  ];

  // We’ll make them all appear as columns:
  // symbol, marketPrice, avgPrice, amount, marketValue, ROI

  // Sort/pagination state for Portfolio
  const [portPage, setPortPage] = useState(0);
  const [portSortKey, setPortSortKey] = useState<string | null>(null);
  const [portSortDir, setPortSortDir] = useState<'asc' | 'desc'>('asc');

  // Handle column header click for the Portfolio
  const handlePortSort = (key: string) => {
    if (portSortKey === key) {
      // toggle the dir if same column
      setPortSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setPortSortKey(key);
      setPortSortDir('asc');
    }
    setPortPage(0); // reset pagination
  };

  // Sorting logic for Portfolio (including derived fields)
  const sortedPortfolioData = useMemo(() => {
    if (!portSortKey) return initialPortfolioData;

    return [...initialPortfolioData].sort((a, b) => {
      // Compute the relevant field based on portSortKey
      const getValue = (row: typeof a) => {
        if (portSortKey === 'symbol') return row.symbol;
        if (portSortKey === 'marketPrice') return row.marketPrice;
        if (portSortKey === 'avgPrice') return row.avgPrice;
        if (portSortKey === 'amount') return row.amount;
        if (portSortKey === 'marketValue') {
          return row.marketPrice * row.amount;
        }
        if (portSortKey === 'roi') {
          return (row.marketPrice - row.avgPrice) / row.avgPrice; // ratio is enough
        }
        return ''; // fallback
      };

      const valA = getValue(a);
      const valB = getValue(b);

      // numeric vs. string
      if (typeof valA === 'number' && typeof valB === 'number') {
        return portSortDir === 'asc' ? valA - valB : valB - valA;
      } else {
        const strA = String(valA).toUpperCase();
        const strB = String(valB).toUpperCase();
        if (strA < strB) return portSortDir === 'asc' ? -1 : 1;
        if (strA > strB) return portSortDir === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [portSortKey, portSortDir]);

  // Pagination slice for Portfolio
  const totalPortPages = Math.ceil(sortedPortfolioData.length / ITEMS_PER_PAGE);
  const portStartIndex = portPage * ITEMS_PER_PAGE;
  const portPageData = sortedPortfolioData.slice(portStartIndex, portStartIndex + ITEMS_PER_PAGE);

  // Pagination
  const handlePortPrev = () => setPortPage((p) => Math.max(p - 1, 0));
  const handlePortNext = () => setPortPage((p) => Math.min(p + 1, totalPortPages - 1));

  /*******************************************************
   * PRIORITY LIST: SORT & PAGINATION
   *******************************************************/
  const initialPriorityData = [
    { ticker: 'JPM', priority: 1 },
    { ticker: 'GS', priority: 2 },
    { ticker: 'SPY', priority: 3 },
    { ticker: 'BTC-USD', priority: 4 },
    { ticker: 'TGT', priority: 5 },
    { ticker: 'TSLA', priority: 6 },
    { ticker: 'AAPL', priority: 7 },
  ];

  const [prioPage, setPrioPage] = useState(0);
  const [prioSortKey, setPrioSortKey] = useState<keyof typeof initialPriorityData[number] | null>(null);
  const [prioSortDir, setPrioSortDir] = useState<'asc' | 'desc'>('asc');

  const handlePrioSort = (key: keyof typeof initialPriorityData[number]) => {
    if (prioSortKey === key) {
      setPrioSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setPrioSortKey(key);
      setPrioSortDir('asc');
    }
    setPrioPage(0);
  };

  const sortedPriorityData = useMemo(() => {
    if (!prioSortKey) return initialPriorityData;
    return [...initialPriorityData].sort((a, b) => {
      const valA = a[prioSortKey];
      const valB = b[prioSortKey];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return prioSortDir === 'asc' ? valA - valB : valB - valA;
      } else {
        const strA = String(valA).toUpperCase();
        const strB = String(valB).toUpperCase();
        if (strA < strB) return prioSortDir === 'asc' ? -1 : 1;
        if (strA > strB) return prioSortDir === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [prioSortKey, prioSortDir]);

  const totalPrioPages = Math.ceil(sortedPriorityData.length / ITEMS_PER_PAGE);
  const prioStartIndex = prioPage * ITEMS_PER_PAGE;
  const prioPageData = sortedPriorityData.slice(prioStartIndex, prioStartIndex + ITEMS_PER_PAGE);

  const handlePrioPrev = () => setPrioPage((p) => Math.max(p - 1, 0));
  const handlePrioNext = () => setPrioPage((p) => Math.min(p + 1, totalPrioPages - 1));

  /*******************************************************
   * AUTOMATION HISTORY TABLE (unchanged) with pagination
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

  const [autoPage, setAutoPage] = useState(0);
  const totalAutoPages = Math.ceil(allAutomationData.length / ITEMS_PER_PAGE);
  const autoStartIndex = autoPage * ITEMS_PER_PAGE;
  const autoPageData = allAutomationData.slice(autoStartIndex, autoStartIndex + ITEMS_PER_PAGE);

  const handleAutoPrev = () => setAutoPage((p) => Math.max(p - 1, 0));
  const handleAutoNext = () => setAutoPage((p) => Math.min(p + 1, totalAutoPages - 1));

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

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourLabels = Array.from({ length: 24 }, (_, i) => i);

  /*******************************************************
   * RENDER
   *******************************************************/
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
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th
                    className="text-left px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePortSort('symbol')}
                  >
                    Asset {portSortKey === 'symbol' ? (portSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="text-right px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePortSort('marketPrice')}
                  >
                    Market Price {portSortKey === 'marketPrice' ? (portSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="text-right px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePortSort('avgPrice')}
                  >
                    Average Price {portSortKey === 'avgPrice' ? (portSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="text-right px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePortSort('amount')}
                  >
                    Amount {portSortKey === 'amount' ? (portSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="text-right px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePortSort('marketValue')}
                  >
                    Market Value {portSortKey === 'marketValue' ? (portSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="text-right px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePortSort('roi')}
                  >
                    ROI (%) {portSortKey === 'roi' ? (portSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {portPageData.map((asset) => {
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
                        className={`text-right px-2 py-3 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}
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

          {/* Pagination controls for Portfolio */}
          <div className="flex items-center mt-4 gap-2">
            <Button variant="outline" disabled={portPage === 0} onClick={handlePortPrev}>
              Prev
            </Button>
            <p className="text-sm">
              Page {portPage + 1} of {totalPortPages}
            </p>
            <Button variant="outline" disabled={portPage === totalPortPages - 1} onClick={handlePortNext}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Priority List Table (sortable + paginated) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Asset Priority List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th
                    className="text-left px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePrioSort('ticker')}
                  >
                    Ticker {prioSortKey === 'ticker' ? (prioSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="text-left px-2 py-3 font-semibold uppercase text-sm cursor-pointer"
                    onClick={() => handlePrioSort('priority')}
                  >
                    Priority {prioSortKey === 'priority' ? (prioSortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {prioPageData.map((item) => (
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

          {/* Pagination controls for Priority List */}
          <div className="flex items-center mt-4 gap-2">
            <Button variant="outline" disabled={prioPage === 0} onClick={handlePrioPrev}>
              Prev
            </Button>
            <p className="text-sm">
              Page {prioPage + 1} of {totalPrioPages}
            </p>
            <Button variant="outline" disabled={prioPage === totalPrioPages - 1} onClick={handlePrioNext}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automation Table (with pagination only) */}
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
                {autoPageData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="px-2 py-3">{item.ticker}</td>
                    <td className="px-2 py-3">{item.time}</td>
                    <td className="px-2 py-3">{item.amount}</td>
                    <td className="px-2 py-3">{item.purchaseType}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination for Automation History */}
            <div className="flex items-center mt-4 gap-2">
              <Button variant="outline" disabled={autoPage === 0} onClick={handleAutoPrev}>
                Prev
              </Button>
              <p className="text-sm">
                Page {autoPage + 1} of {totalAutoPages}
              </p>
              <Button variant="outline" disabled={autoPage === totalAutoPages - 1} onClick={handleAutoNext}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day/Time Heatmap Card (Restored) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Automation Execution Heatmap (Day vs. Hour)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-sm"></th>
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
