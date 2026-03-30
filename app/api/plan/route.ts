import { NextRequest, NextResponse } from 'next/server';
import { generateTripOptions } from '@/lib/planner';
import { mockGenerateTripOptions } from '@/lib/mock-data';
import { PlanRequestSchema, validateInput, formatZodErrors } from '@/lib/validation';
import { Errors, CaddyError } from '@/lib/errors';
import { successResponse, errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== 'false'; // Default to true

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const body = await req.json();

    // Mock path: skip strict validation, use mock generator
    if (USE_MOCK_DATA) {
      console.log('Using mock data for plan (cost optimization)');
      const tripBrief = body.trip_brief || {};
      const options = mockGenerateTripOptions(tripBrief);

      return NextResponse.json({
        success: true,
        data: {
          schema_version: '1.0',
          options,
          ranked_option_ids: options.map((o: { id: string }) => o.id),
          notes: `Generated ${options.length} trip options based on your preferences`,
        },
      });
    }

    // Real path: validate request body strictly
    const validation = validateInput(PlanRequestSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid trip brief. Please check your input.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const tripBrief = validation.data.trip_brief;
    logger.info('Generating trip options', {
      origin: `${tripBrief.origin.city}, ${tripBrief.origin.state}`,
      players: tripBrief.party.players,
      nights: tripBrief.dates.nights,
    });

    // Generate trip options using database-backed planner
    const options = await generateTripOptions(tripBrief);

    if (options.length === 0) {
      logger.warn('No trip options generated');
      throw Errors.planningError('No destinations found matching your criteria');
    }

    logger.info('Trip options generated', { count: options.length });

    return NextResponse.json({
      success: true,
      data: {
        schema_version: '1.0',
        options,
        ranked_option_ids: options.map(o => o.id),
        notes: `Generated ${options.length} trip options based on your preferences`,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Planning error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to generate trip options. Please try again.');
  }
}
