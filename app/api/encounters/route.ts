import { NextResponse } from 'next/server';
import { fetchFromApi } from '@/lib/api-utils';
import { EncounterApiResponse } from '@/types/encounter';

/**
 * GET handler for /api/encounters
 * Fetches all encounters from the external API and processes them
 */
export async function GET() {
  try {
    console.log(`Fetching encounters from route: /api/encounters`);
    
    // Use the centralized API utility to fetch data
    const data = await fetchFromApi<any>('encounters');

    // Strictly require an array response
    if (!Array.isArray(data)) {
      console.error('API returned non-array data for encounters:', data);
      throw new Error('Invalid API response format: expected an array of encounters');
    }

    // Process each encounter to ensure ai_codes is in the correct format
    const processedData = data.map((encounter: any) => {
      // Process ai_codes
      if (encounter.ai_codes && Array.isArray(encounter.ai_codes)) {
        encounter.ai_codes = encounter.ai_codes.map((aiCode: any) => ({
          code: aiCode.code || '',
          description: aiCode.description || '',
          audit: aiCode.audit || aiCode.evidence || null,
          icdCodes: aiCode.icdCodes || []
        }));
      } else {
        encounter.ai_codes = [];
      }

      // Process codes
      if (encounter.codes && Array.isArray(encounter.codes)) {
        encounter.codes = encounter.codes.map((code: any) => ({
          code: code.code || code.id || '',
          description: code.description || '',
          audit: code.audit || code.evidence || null,
          icdCodes: code.icdCodes || []
        }));
      } else {
        encounter.codes = [];
      }

      return encounter;
    });

    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error('Failed to fetch encounters:', error);

    // Return error with appropriate status code
    return new NextResponse(
      JSON.stringify({
        message: error.message || 'Failed to fetch encounters',
      }),
      {
        status: error.statusCode || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
