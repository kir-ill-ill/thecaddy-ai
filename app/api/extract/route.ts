import { NextRequest, NextResponse } from 'next/server';
import { mockExtractTripBrief } from '@/lib/mock-data';
import { ExtractTripBriefRequest, ExtractTripBriefResponse } from '@/lib/types';
import { callClaude } from '@/lib/claude';
import { EXTRACTOR_SYSTEM_PROMPT, buildExtractorPrompt } from '@/lib/prompts';

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

    // Call Claude Haiku for fast extraction
    const userPrompt = buildExtractorPrompt(user_message, chat_context, body.now_date);
    const raw = await callClaude({
      system: EXTRACTOR_SYSTEM_PROMPT,
      userMessage: userPrompt,
      model: 'claude-haiku-4-5-20251001',
      maxTokens: 2048,
    });

    const result: ExtractTripBriefResponse = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract trip brief', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
