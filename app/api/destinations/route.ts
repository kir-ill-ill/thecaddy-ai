import { NextRequest, NextResponse } from 'next/server';
import { getDestinations } from '@/lib/db';
import { searchDestinationsByOrigin } from '@/lib/planner';
import { DestinationSearchSchema, validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger, parseFloatParam } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/destinations - List all destinations or search by origin
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { searchParams } = new URL(req.url);
    const originCity = searchParams.get('originCity');
    const originState = searchParams.get('originState');
    const maxDriveHoursRaw = searchParams.get('maxDriveHours');

    // If searching by origin, validate parameters
    if (originCity || originState) {
      const validation = validateInput(DestinationSearchSchema, {
        originCity: originCity || undefined,
        originState: originState || undefined,
        maxDriveHours: maxDriveHoursRaw ? parseFloat(maxDriveHoursRaw) : undefined,
      });

      if (!validation.success) {
        logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid search parameters.',
              details: { validationErrors: formatZodErrors(validation.error) },
            },
          },
          { status: 400 }
        );
      }

      const { originCity: city, originState: state, maxDriveHours } = validation.data;

      if (city && state) {
        logger.info('Searching destinations by origin', { city, state, maxDriveHours });
        const destinations = await searchDestinationsByOrigin(city, state, maxDriveHours || 4);
        return NextResponse.json({
          success: true,
          data: { destinations },
        });
      }
    }

    // Return all destinations
    logger.info('Fetching all destinations');
    const destinations = await getDestinations();
    return NextResponse.json({
      success: true,
      data: { destinations },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Destinations error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to fetch destinations. Please try again.');
  }
}
