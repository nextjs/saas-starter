import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowRun, updateWorkflowRun, createCreditTransaction } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-n8n-secret') || '';
    const expectedSecret = process.env.N8N_CALLBACK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      // Also check body secret as fallback
      const body = await request.json();
      if (body.secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return handleCallback(body);
    }

    const body = await request.json();
    return handleCallback(body);
  } catch (error: any) {
    console.error('n8n callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCallback(body: any) {
  const { runId, status, output, error } = body;

  if (!runId || !status) {
    return NextResponse.json({ error: 'runId and status are required' }, { status: 400 });
  }

  if (!['succeeded', 'failed'].includes(status)) {
    return NextResponse.json({ error: 'status must be succeeded or failed' }, { status: 400 });
  }

  // Idempotence: check current status
  const run = await getWorkflowRun(runId);
  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  if (run.status === 'succeeded' || run.status === 'failed') {
    return NextResponse.json({ message: 'Already processed' });
  }

  await updateWorkflowRun(runId, {
    status,
    output: output || null,
    error: error || null,
  });

  // Refund credits if workflow failed via n8n callback
  if (status === 'failed') {
    await createCreditTransaction({
      userId: run.userId,
      type: 'refund',
      amount: run.creditCost || 0,
      reason: `Refund: workflow run #${runId} failed via n8n callback`,
      relatedRunId: runId,
    });
  }

  return NextResponse.json({ ok: true });
}
