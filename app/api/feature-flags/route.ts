import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam, getTeamForUser } from '@/lib/db/queries';
import { getFeaturesForPlan, isFeatureEnabledForPlan } from '@/lib/feature-flags/service';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    const planName = team?.planName || null;

    const availableFeatures = getFeaturesForPlan(planName);

    const features = availableFeatures.reduce((acc, feature) => {
      acc[feature] = isFeatureEnabledForPlan(feature, planName);
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      success: true,
      plan: planName || 'free',
      features,
    });
  } catch (error) {
    console.error('Feature flags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}
