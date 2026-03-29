import { NextRequest, NextResponse } from 'next/server';
import { getTripById, getTripByShareCode, getTripOptions, getGroupResponses, Trip, TripOption, GroupResponse } from '@/lib/db';
import { CaddyError, Errors } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface VoteSummary {
  optionVotes: Record<string, number>;
  voters: Record<number, string>;
  totalVoters: number;
  rankedOptions: Array<{ optionId: string; votes: number }>;
  consensus: boolean;
}

function calculateVoteSummary(responses: GroupResponse[]): VoteSummary {
  const optionVotes: Record<string, number> = {};
  const voters: Record<number, string> = {};

  responses.forEach(response => {
    if (response.preferred_option_id) {
      optionVotes[response.preferred_option_id] = (optionVotes[response.preferred_option_id] || 0) + 1;
    }
    voters[response.id] = response.name;
  });

  const totalVoters = responses.length;
  const rankedOptions = Object.entries(optionVotes)
    .map(([optionId, votes]) => ({ optionId, votes }))
    .sort((a, b) => b.votes - a.votes);

  return {
    optionVotes,
    voters,
    totalVoters,
    rankedOptions,
    consensus: rankedOptions.length > 0 && rankedOptions[0].votes / Math.max(totalVoters, 1) >= 0.6,
  };
}

// GET /api/trips/[id] - Get trip by ID or share code
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { id: idOrCode } = await params;

    if (!idOrCode || idOrCode.length < 1) {
      throw Errors.missingField('id');
    }

    logger.info('Fetching trip', { idOrCode });

    // Try to find by ID first (UUID format), then by share code
    let trip: Trip | null = null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);

    if (isUUID) {
      trip = await getTripById(idOrCode);
    }

    if (!trip) {
      trip = await getTripByShareCode(idOrCode);
    }

    if (!trip) {
      logger.warn('Trip not found', { idOrCode });
      throw Errors.tripNotFound(idOrCode);
    }

    // Get associated options and responses
    const options = await getTripOptions(trip.id);
    const responses = await getGroupResponses(trip.id);

    // Calculate vote summary
    const voteSummary = calculateVoteSummary(responses);

    logger.info('Trip loaded', { tripId: trip.id, optionCount: options.length, responseCount: responses.length });

    return NextResponse.json({
      success: true,
      data: {
        ...trip,
        options,
        responses,
        voteSummary,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Trip fetch error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to load trip. Please try again.');
  }
}
