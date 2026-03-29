import { NextRequest, NextResponse } from 'next/server';
import { callMCPTool } from '@/lib/mcp-client';
import { mockExtractTripBrief } from '@/lib/mock-data';
import { ExtractTripBriefRequest, ExtractTripBriefResponse } from '@/lib/types';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== 'false'; // Default to true

export async function POST(req: NextRequest) {
  try {
    const body: ExtractTripBriefRequest = await req.json();

    const { user_message, chat_context } = body;

    // Use mock data by default to save API costs
    if (USE_MOCK_DATA) {
      console.log('Using mock data for extract (cost optimization)');
      const result = mockExtractTripBrief(user_message, chat_context);
      return NextResponse.json(result);
    }

    // Real AI call (only if explicitly enabled)
    const result: ExtractTripBriefResponse = await callMCPTool('extract_trip_brief', {
      user_message,
      chat_context,
      now_date: body.now_date,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract trip brief', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
