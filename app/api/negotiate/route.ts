import { NextRequest, NextResponse } from 'next/server';
import { callMCPTool } from '@/lib/mcp-client';
import { NegotiatePlanRequest, NegotiatePlanResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: NegotiatePlanRequest = await req.json();

    const { trip_brief, shortlist, group_responses } = body;

    // Call MCP server tool
    const result: NegotiatePlanResponse = await callMCPTool('negotiate_plan', {
      trip_brief,
      shortlist,
      group_responses,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Negotiate API error:', error);
    return NextResponse.json(
      { error: 'Failed to negotiate plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
