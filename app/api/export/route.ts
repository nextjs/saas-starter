import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { exportTeamData, convertToJSON, convertToCSV } from '@/lib/export/service';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const dataType = searchParams.get('type') || 'full';

    const teamData = await exportTeamData(userWithTeam.teamId);

    if (format === 'csv') {
      let csvContent = '';

      if (dataType === 'activities') {
        csvContent = convertToCSV(teamData.activities);
      } else if (dataType === 'members') {
        csvContent = convertToCSV(teamData.members);
      } else {
        return NextResponse.json(
          { error: 'CSV format only supports activities or members export' },
          { status: 400 }
        );
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${dataType}-export-${Date.now()}.csv"`,
        },
      });
    }

    // JSON format
    const jsonContent = convertToJSON(teamData);

    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="team-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
