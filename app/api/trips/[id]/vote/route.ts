import { NextRequest, NextResponse } from 'next/server';
import { getTripById, getTripByShareCode, getTripOptions, getGroupResponses, saveGroupResponse, Trip, GroupResponse } from '@/lib/db';
import { VoteRequestSchema, validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError, Errors } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Vote submission schema
const SubmitVoteSchema = z.object({
  voterName: z.string().min(1).max(100).trim(),
  voterEmail: z.string().email().optional(),
  preferredOptionId: z.string().optional(),
  budgetOk: z.boolean().optional(),
  lodgingPref: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

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

async function findTrip(idOrCode: string): Promise<Trip | null> {
  // Try share code first (more common for voting), then UUID
  let trip = await getTripByShareCode(idOrCode);
  if (!trip) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
    if (isUUID) {
      trip = await getTripById(idOrCode);
    }
  }
  return trip;
}

// POST /api/trips/[id]/vote - Submit a vote (swipe right = vote for option)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { id: idOrCode } = await params;
    const body = await req.json();

    // Validate request body
    const validation = validateInput(SubmitVoteSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid vote data. Please check your input.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const { voterName, voterEmail, preferredOptionId, budgetOk, lodgingPref, notes } = validation.data;

    // Find the trip
    const trip = await findTrip(idOrCode);
    if (!trip) {
      logger.warn('Trip not found', { idOrCode });
      throw Errors.tripNotFound(idOrCode);
    }

    logger.info('Submitting vote', { tripId: trip.id, voterName, preferredOptionId });

    // Save the vote/response
    await saveGroupResponse({
      trip_id: trip.id,
      name: voterName,
      email: voterEmail,
      preferred_option_id: preferredOptionId,
      budget_ok: budgetOk,
      lodging_pref: lodgingPref,
      notes,
    });

    // Get updated responses and calculate summary
    const responses = await getGroupResponses(trip.id);
    const voteSummary = calculateVoteSummary(responses);

    logger.info('Vote submitted', { tripId: trip.id, totalVotes: responses.length });

    return NextResponse.json({
      success: true,
      data: {
        voteSummary,
        totalVotes: responses.length,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Vote submission error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to submit vote. Please try again.');
  }
}

// GET /api/trips/[id]/vote - Get vote summary
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { id: idOrCode } = await params;

    const trip = await findTrip(idOrCode);
    if (!trip) {
      logger.warn('Trip not found', { idOrCode });
      throw Errors.tripNotFound(idOrCode);
    }

    const options = await getTripOptions(trip.id);
    const responses = await getGroupResponses(trip.id);
    const voteSummary = calculateVoteSummary(responses);

    logger.info('Fetched vote summary', { tripId: trip.id, totalVotes: responses.length });

    return NextResponse.json({
      success: true,
      data: {
        trip,
        options,
        responses,
        voteSummary,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Vote fetch error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to get votes. Please try again.');
  }
}
