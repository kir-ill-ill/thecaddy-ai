import { NextRequest, NextResponse } from 'next/server';
import { createTrip, saveTripOption, getTripById } from '@/lib/db';
import { TripBriefAPISchema, validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError, Errors } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema for creating a trip
const CreateTripRequestSchema = z.object({
  tripBrief: TripBriefAPISchema,
  options: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    tagline: z.string().optional(),
    destination: z.string(),
    destination_id: z.number().optional(),
    cost_estimate: z.object({
      per_person_estimated: z.number().optional(),
      breakdown: z.object({
        lodging: z.number().optional(),
        golf: z.number().optional(),
        food: z.number().optional(),
        local_transport: z.number().optional(),
      }).optional(),
    }).optional(),
    score_breakdown: z.object({
      total: z.number().optional(),
      budget_fit: z.number().optional(),
      travel_fit: z.number().optional(),
      logistics: z.number().optional(),
      vibe_match: z.number().optional(),
      course_quality_proxy: z.number().optional(),
    }).optional(),
    why_it_fits: z.array(z.string()).optional(),
  })).optional(),
  creatorName: z.string().optional(),
  creatorEmail: z.string().email().optional(),
});

// POST /api/trips - Create a new trip
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const body = await req.json();

    // Validate request body
    const validation = validateInput(CreateTripRequestSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid trip data. Please check your input.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const { tripBrief, options, creatorEmail } = validation.data;

    logger.info('Creating trip', {
      origin: `${tripBrief.origin.city}, ${tripBrief.origin.state}`,
      players: tripBrief.party.players,
    });

    // Create the trip in the database
    const tripId = await createTrip({
      trip_name: tripBrief.trip_name || 'Golf Trip',
      origin_city: tripBrief.origin.city,
      origin_state: tripBrief.origin.state,
      players: tripBrief.party.players,
      start_date: tripBrief.dates.start,
      end_date: tripBrief.dates.end,
      nights: tripBrief.dates.nights,
      budget_per_person: tripBrief.budget.per_person,
      budget_scope: tripBrief.budget.scope,
      vibe: tripBrief.preferences.vibe,
      travel_mode: tripBrief.preferences.travel_mode,
      lodging_pref: tripBrief.preferences.lodging,
      golf_density: tripBrief.preferences.golf_density,
      tee_time_pref: tripBrief.preferences.tee_time,
      max_drive_hours: tripBrief.constraints.max_drive_hours || 4,
      captain_email: creatorEmail || undefined,
    });

    // Save trip options if provided
    if (options && Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await saveTripOption({
          trip_id: tripId,
          option_code: opt.id || `opt_${String.fromCharCode(97 + i)}`,
          title: opt.title,
          tagline: opt.tagline,
          destination_id: opt.destination_id || 1,
          destination_name: opt.destination,
          cost_per_person: opt.cost_estimate?.per_person_estimated,
          cost_lodging: opt.cost_estimate?.breakdown?.lodging,
          cost_golf: opt.cost_estimate?.breakdown?.golf,
          cost_food: opt.cost_estimate?.breakdown?.food,
          cost_transport: opt.cost_estimate?.breakdown?.local_transport,
          score_total: opt.score_breakdown?.total,
          score_budget_fit: opt.score_breakdown?.budget_fit,
          score_travel_fit: opt.score_breakdown?.travel_fit,
          score_logistics: opt.score_breakdown?.logistics,
          score_vibe_match: opt.score_breakdown?.vibe_match,
          score_course_quality: opt.score_breakdown?.course_quality_proxy,
          why_it_fits: opt.why_it_fits,
          rank: i + 1,
        });
      }
    }

    // Get the share code from the database
    const tripData = await getTripById(tripId);
    const shareCode = tripData?.share_code || tripId;

    logger.info('Trip created', { tripId, shareCode });

    return NextResponse.json({
      success: true,
      data: {
        tripId,
        shareCode,
        shareUrl: `/vote/${shareCode}`,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Trip creation error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to create trip. Please try again.');
  }
}
