import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserCreditBalance, getWorkflowBySlug, createWorkflowRun, createCreditTransaction, updateWorkflowRun } from '@/lib/db/queries';
import { isValidProvider } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workflowSlug, model, inputs } = body;

    if (!workflowSlug) {
      return NextResponse.json({ error: 'workflowSlug is required' }, { status: 400 });
    }

    // Validate workflow
    const workflow = await getWorkflowBySlug(workflowSlug);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found or inactive' }, { status: 404 });
    }

    // Validate model if provided
    if (model && !isValidProvider(model)) {
      return NextResponse.json({ error: 'Invalid model/provider' }, { status: 400 });
    }

    // Check allowed models for workflow
    if (model && workflow.allowedModels && workflow.allowedModels.length > 0) {
      if (!workflow.allowedModels.includes(model)) {
        return NextResponse.json({ error: 'Model not allowed for this workflow' }, { status: 403 });
      }
    }

    // Check credit balance
    const balance = await getUserCreditBalance(user.id);
    if (balance < workflow.creditCost) {
      return NextResponse.json({ error: 'Insufficient credits', balance, required: workflow.creditCost }, { status: 402 });
    }

    // Create run
    const run = await createWorkflowRun({
      userId: user.id,
      workflowId: workflow.id,
      model: model || null,
      input: inputs || null,
    });

    // Debit credits
    await createCreditTransaction({
      userId: user.id,
      type: 'spend',
      amount: -workflow.creditCost,
      reason: `Workflow run: ${workflow.name}`,
      relatedRunId: run.id,
    });

    // Call n8n webhook
    if (workflow.n8nWebhookUrl) {
      try {
        const n8nPayload = {
          runId: run.id,
          userId: user.id,
          workflowSlug: workflow.slug,
          model: model || null,
          inputs: inputs || {},
          fanverseSecret: process.env.N8N_CALLBACK_SECRET,
          callbackUrl: `${process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL}/api/n8n/callback`,
        };

        const n8nResponse = await fetch(workflow.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
        });

        if (n8nResponse.ok) {
          await updateWorkflowRun(run.id, { status: 'running' });
        } else {
          await updateWorkflowRun(run.id, { status: 'failed', error: `n8n returned ${n8nResponse.status}` });
          // Refund credits on failure
          await createCreditTransaction({
            userId: user.id,
            type: 'refund',
            amount: workflow.creditCost,
            reason: `Refund: workflow ${workflow.name} failed (n8n ${n8nResponse.status})`,
            relatedRunId: run.id,
          });
        }
      } catch (err: any) {
        await updateWorkflowRun(run.id, { status: 'failed', error: err.message || 'n8n call failed' });
        // Refund credits on failure
        await createCreditTransaction({
          userId: user.id,
          type: 'refund',
          amount: workflow.creditCost,
          reason: `Refund: workflow ${workflow.name} failed (${err.message || 'n8n call failed'})`,
          relatedRunId: run.id,
        });
      }
    } else {
      await updateWorkflowRun(run.id, { status: 'running' });
    }

    return NextResponse.json({ runId: run.id, status: run.status });
  } catch (error: any) {
    console.error('Workflow run error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
