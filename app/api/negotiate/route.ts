import { NextRequest, NextResponse } from 'next/server';
import { callMCPTool } from '@/lib/mcp-client';
import { NegotiatePlanRequest, NegotiatePlanResponse } from '@/lib/types';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== 'false'; // Default to true

function mockNegotiate(body: NegotiatePlanRequest): NegotiatePlanResponse {
  const { shortlist, trip_brief } = body;
  const chosenOption = shortlist[0];

  return {
    schema_version: '1.0',
    strategies: [
      {
        id: 'strat_a',
        title: 'Go with the Group Favorite',
        what_changes: ['Select the top-voted option as-is'],
        pros: ['Group consensus already reached', 'No further negotiation needed'],
        cons: ['May not satisfy everyone perfectly'],
        risk_level: 'low',
      },
      {
        id: 'strat_b',
        title: 'Hybrid Compromise',
        what_changes: [
          'Use the top-voted destination',
          'Adjust lodging based on budget feedback',
          'Keep the most popular courses',
        ],
        pros: ['Balances budget concerns', 'Keeps most popular elements'],
        cons: ['Requires some re-planning'],
        risk_level: 'medium',
      },
    ],
    final_recommendation: {
      chosen_option_id: chosenOption?.id || 'opt_a',
      message_to_group: `Great news! Based on everyone's input, we're going with "${chosenOption?.title || 'the top option'}". This option best fits the group's preferences and budget.`,
      final_itinerary: chosenOption?.itinerary || [],
      pricing_model: {
        base_per_person: chosenOption?.cost_estimate?.per_person_estimated || trip_brief.budget.per_person,
        upgrades_optional: [
          { name: 'Premium course upgrade', delta_per_person: 75 },
          { name: 'Spa package', delta_per_person: 50 },
        ],
        notes: 'Base price covers golf, lodging, and meals. Optional upgrades available.',
      },
    },
    follow_up_needed: false,
    follow_up_question: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: NegotiatePlanRequest = await req.json();

    const { trip_brief, shortlist, group_responses } = body;

    // Use mock data by default to save API costs
    if (USE_MOCK_DATA) {
      console.log('Using mock data for negotiate (cost optimization)');
      const result = mockNegotiate(body);
      return NextResponse.json(result);
    }

    // Real AI call (only if explicitly enabled)
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
