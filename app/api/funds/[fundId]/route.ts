import { NextRequest, NextResponse } from 'next/server';
import { getFundSummary, verifyCaptainAccess, updateFund } from '@/lib/payments';
import { UpdateFundSchema, CaptainAccessSchema } from '@/lib/payments/validation';
import { validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError, Errors } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/funds/[fundId] - Get fund details (requires captain access code)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fundId: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { fundId } = await params;
    const { searchParams } = new URL(req.url);
    const accessCode = searchParams.get('code');

    if (!accessCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Access code is required.',
          },
        },
        { status: 401 }
      );
    }

    // Verify captain access
    const hasAccess = await verifyCaptainAccess(fundId, accessCode);
    if (!hasAccess) {
      logger.warn('Invalid captain access code', { fundId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid access code.',
          },
        },
        { status: 401 }
      );
    }

    logger.info('Fetching fund summary', { fundId });

    const summary = await getFundSummary(fundId);
    if (!summary) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Fund not found.',
          },
        },
        { status: 404 }
      );
    }

    // Remove sensitive data from response
    const { captain_access_code, ...fundData } = summary.fund;

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        fund: fundData,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Fund fetch error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to fetch fund. Please try again.');
  }
}

// PATCH /api/funds/[fundId] - Update fund settings
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fundId: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { fundId } = await params;
    const body = await req.json();

    // Extract and validate access code
    const accessCode = body.access_code;
    if (!accessCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Access code is required.',
          },
        },
        { status: 401 }
      );
    }

    // Verify captain access
    const hasAccess = await verifyCaptainAccess(fundId, accessCode);
    if (!hasAccess) {
      logger.warn('Invalid captain access code', { fundId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid access code.',
          },
        },
        { status: 401 }
      );
    }

    // Validate update data
    const validation = validateInput(UpdateFundSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    logger.info('Updating fund', { fundId });

    const updatedFund = await updateFund(fundId, validation.data);
    if (!updatedFund) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Fund not found.',
          },
        },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { captain_access_code, ...fundData } = updatedFund;

    return NextResponse.json({
      success: true,
      data: { fund: fundData },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Fund update error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to update fund. Please try again.');
  }
}
