import { NextRequest, NextResponse } from 'next/server';
import { getLodgingByDestination, getLodgingByType } from '@/lib/db';
import { LodgingQuerySchema, validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError, Errors } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/lodging - List lodging by destination
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { searchParams } = new URL(req.url);
    const destinationIdRaw = searchParams.get('destinationId');
    const lodgingType = searchParams.get('type');

    // destinationId is required
    if (!destinationIdRaw) {
      logger.warn('Missing destinationId parameter');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'destinationId is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate query parameters
    const validation = validateInput(LodgingQuerySchema, {
      destinationId: parseInt(destinationIdRaw, 10),
      type: lodgingType || undefined,
    });

    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const { destinationId, type } = validation.data;

    if (type) {
      // Get lodging by type
      logger.info('Fetching lodging by type', { destinationId, type });
      const lodging = await getLodgingByType(destinationId, type);
      return NextResponse.json({
        success: true,
        data: { lodging },
      });
    }

    // Get all lodging for destination
    logger.info('Fetching lodging by destination', { destinationId });
    const lodging = await getLodgingByDestination(destinationId);
    return NextResponse.json({
      success: true,
      data: { lodging },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Lodging error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to fetch lodging. Please try again.');
  }
}
