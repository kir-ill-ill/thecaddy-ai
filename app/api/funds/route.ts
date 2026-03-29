import { NextRequest, NextResponse } from 'next/server';
import { createFund, getFundByTripId } from '@/lib/payments';
import { CreateFundSchema } from '@/lib/payments/validation';
import { validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// POST /api/funds - Create a new fund for a trip
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const body = await req.json();

    // Validate request
    const validation = validateInput(CreateFundSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid fund data. Please check your input.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if fund already exists for this trip
    const existingFund = await getFundByTripId(data.trip_id);
    if (existingFund) {
      logger.warn('Fund already exists for trip', { tripId: data.trip_id });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FUND_EXISTS',
            message: 'A fund already exists for this trip.',
          },
        },
        { status: 409 }
      );
    }

    logger.info('Creating fund', {
      tripId: data.trip_id,
      fundType: data.fund_type,
      captainEmail: data.captain_email,
    });

    // Create the fund
    const fund = await createFund({
      trip_id: data.trip_id,
      name: data.name,
      target_amount_per_person: data.target_amount_per_person,
      target_total: data.target_total,
      fund_type: data.fund_type,
      description: data.description,
      due_date: data.due_date,
      captain_email: data.captain_email,
    });

    logger.info('Fund created', { fundId: fund.id });

    return NextResponse.json({
      success: true,
      data: {
        fund,
        // Include the captain access code in the response (only shown once)
        captain_access_code: fund.captain_access_code,
        manage_url: `/trip/${data.trip_id}/fund/manage?code=${fund.captain_access_code}`,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Fund creation error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to create fund. Please try again.');
  }
}
