'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, Receipt } from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl: string;
}

export default function BillingPage() {
  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      date: '2025-11-01',
      amount: 29.99,
      status: 'paid',
      description: 'Plus Plan - November 2025',
      invoiceUrl: '#',
    },
    {
      id: 'INV-002',
      date: '2025-10-01',
      amount: 29.99,
      status: 'paid',
      description: 'Plus Plan - October 2025',
      invoiceUrl: '#',
    },
    {
      id: 'INV-003',
      date: '2025-09-01',
      amount: 19.99,
      status: 'paid',
      description: 'Base Plan - September 2025',
      invoiceUrl: '#',
    },
  ]);

  const currentPlan = {
    name: 'Plus Plan',
    amount: 29.99,
    interval: 'month',
    nextBilling: '2025-12-01',
    status: 'active',
  };

  function downloadInvoice(invoice: Invoice) {
    // In a real app, this would download the PDF invoice
    console.log('Downloading invoice:', invoice.id);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and view billing history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your active plan and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {currentPlan.status}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(currentPlan.amount)}
                <span className="text-sm text-muted-foreground font-normal">
                  {' '}
                  / {currentPlan.interval}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Next billing date: {formatDate(currentPlan.nextBilling)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Update Payment Method</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.id} • {formatDate(invoice.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p
                      className={`text-sm ${
                        invoice.status === 'paid'
                          ? 'text-green-600'
                          : invoice.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </p>
                  </div>
                  <Button
                    onClick={() => downloadInvoice(invoice)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
