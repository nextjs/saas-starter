'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { JobOperation } from '@/lib/db/schema';
import { completeJobOperation, createJobOperation } from '../actions';

type ActionState = {
  error?: string;
};

function formatDateTime(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString();
}

function OperationRow({
  jobId,
  operation
}: {
  jobId: number;
  operation: JobOperation;
}) {
  const [completeState, completeAction, isCompletePending] = useActionState<
    ActionState,
    FormData
  >(completeJobOperation, {});

  return (
    <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0">
      <div>
        <p className="font-medium">
          {operation.sequence}. {operation.description || '—'}
        </p>
        <p className="text-sm text-muted-foreground">
          Machine: {operation.machine || '—'}
        </p>
        {operation.completedAt ? (
          <p className="text-sm text-muted-foreground">
            Completed by {operation.completedBy || '—'} on{' '}
            {formatDateTime(operation.completedAt)}
          </p>
        ) : null}
      </div>
      {!operation.completedAt ? (
        <div className="flex flex-col items-start gap-2">
          <form action={completeAction}>
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="operationId" value={operation.id} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isCompletePending}
            >
              {isCompletePending ? 'Completing...' : 'Mark Complete'}
            </Button>
          </form>
          {completeState?.error ? (
            <p className="text-red-500 text-sm">{completeState.error}</p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function JobOperations({
  jobId,
  operations
}: {
  jobId: number;
  operations: JobOperation[];
}) {
  const [createState, createAction, isCreatePending] = useActionState<
    ActionState,
    FormData
  >(createJobOperation, {});

  return (
    <div className="space-y-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <p className="text-muted-foreground">No operations yet.</p>
          ) : (
            <ul className="space-y-4">
              {operations.map((operation) => (
                <OperationRow
                  key={operation.id}
                  jobId={jobId}
                  operation={operation}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="space-y-4">
            <input type="hidden" name="jobId" value={jobId} />
            <div>
              <Label htmlFor="sequence" className="mb-2">
                Sequence
              </Label>
              <Input
                id="sequence"
                name="sequence"
                type="number"
                min="1"
                placeholder="Enter sequence"
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter description"
                required
              />
            </div>
            <div>
              <Label htmlFor="machine" className="mb-2">
                Machine
              </Label>
              <Input
                id="machine"
                name="machine"
                placeholder="Enter machine"
                required
              />
            </div>
            {createState?.error && (
              <p className="text-red-500 text-sm">{createState.error}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isCreatePending}
            >
              {isCreatePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Operation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
