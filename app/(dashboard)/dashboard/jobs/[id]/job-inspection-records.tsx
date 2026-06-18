'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { InspectionRecord, JobOperation } from '@/lib/db/schema';
import { createInspectionRecord } from '../actions';

type ActionState = {
  error?: string;
};

function formatDateTime(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString();
}

function formatOperation(
  operationId: number | null,
  operations: JobOperation[]
) {
  if (!operationId) return '—';
  const operation = operations.find((op) => op.id === operationId);
  if (!operation) return '—';
  return `${operation.sequence}. ${operation.description || '—'}`;
}

export function JobInspectionRecords({
  jobId,
  operations,
  records
}: {
  jobId: number;
  operations: JobOperation[];
  records: InspectionRecord[];
}) {
  const [createState, createAction, isCreatePending] = useActionState<
    ActionState,
    FormData
  >(createInspectionRecord, {});

  return (
    <div className="space-y-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground">No inspection records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Dimension</th>
                    <th className="pb-3 pr-4 font-medium">Nominal Spec</th>
                    <th className="pb-3 pr-4 font-medium">Actual Value</th>
                    <th className="pb-3 pr-4 font-medium">Result</th>
                    <th className="pb-3 pr-4 font-medium">Operation</th>
                    <th className="pb-3 pr-4 font-medium">Inspector</th>
                    <th className="pb-3 font-medium">Inspected At</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium">
                        {record.dimension || '—'}
                      </td>
                      <td className="py-3 pr-4">{record.nominalSpec || '—'}</td>
                      <td className="py-3 pr-4">{record.actualValue || '—'}</td>
                      <td className="py-3 pr-4 capitalize">
                        {record.result || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        {formatOperation(record.operationId, operations)}
                      </td>
                      <td className="py-3 pr-4">{record.inspector || '—'}</td>
                      <td className="py-3">
                        {formatDateTime(record.inspectedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Inspection Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="space-y-4">
            <input type="hidden" name="jobId" value={jobId} />
            <div>
              <Label htmlFor="dimension" className="mb-2">
                Dimension
              </Label>
              <Input
                id="dimension"
                name="dimension"
                placeholder="What was measured"
                required
              />
            </div>
            <div>
              <Label htmlFor="nominalSpec" className="mb-2">
                Nominal Spec
              </Label>
              <Input
                id="nominalSpec"
                name="nominalSpec"
                placeholder="Enter nominal spec"
                required
              />
            </div>
            <div>
              <Label htmlFor="actualValue" className="mb-2">
                Actual Value
              </Label>
              <Input
                id="actualValue"
                name="actualValue"
                placeholder="Enter actual value"
                required
              />
            </div>
            <div>
              <Label htmlFor="result" className="mb-2">
                Result
              </Label>
              <select
                id="result"
                name="result"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select result</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
            <div>
              <Label htmlFor="operationId" className="mb-2">
                Operation (optional)
              </Label>
              <select
                id="operationId"
                name="operationId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">None</option>
                {operations.map((operation) => (
                  <option key={operation.id} value={operation.id}>
                    {operation.sequence}. {operation.description || '—'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="inspector" className="mb-2">
                Inspector
              </Label>
              <Input
                id="inspector"
                name="inspector"
                placeholder="Enter inspector name"
                required
              />
            </div>
            <div>
              <Label htmlFor="inspectedAt" className="mb-2">
                Inspected At
              </Label>
              <Input
                id="inspectedAt"
                name="inspectedAt"
                type="datetime-local"
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
                  Add Inspection Record
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
