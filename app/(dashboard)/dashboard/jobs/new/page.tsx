'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { createJob } from '../actions';

type ActionState = {
  error?: string;
};

export default function NewJobPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createJob,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        New Job
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            <div>
              <Label htmlFor="jobNumber" className="mb-2">
                Job Number
              </Label>
              <Input
                id="jobNumber"
                name="jobNumber"
                placeholder="Enter job number"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerName" className="mb-2">
                Customer Name
              </Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="partNumber" className="mb-2">
                Part Number
              </Label>
              <Input
                id="partNumber"
                name="partNumber"
                placeholder="Enter part number"
              />
            </div>
            <div>
              <Label htmlFor="partRevision" className="mb-2">
                Part Revision
              </Label>
              <Input
                id="partRevision"
                name="partRevision"
                placeholder="Enter part revision"
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="mb-2">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="mb-2">
                Due Date
              </Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Job
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/jobs">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
