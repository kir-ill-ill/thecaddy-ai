import { NextRequest, NextResponse } from 'next/server';
import {
  getFundByTripId,
  verifyCaptainAccess,
  getFundSummary,
} from '@/lib/payments';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/funds/by-trip/[tripId] - Get fund by trip ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { tripId } = await params;
    const { searchParams } = new URL(req.url);
    const accessCode = searchParams.get('code');

    if (!accessCode) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Access code is required.' },
        },
        { status: 401 }
      );
    }

    // Get fund by trip ID
    const fund = await getFundByTripId(tripId);
    if (!fund) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'No fund exists for this trip.' },
        },
        { status: 404 }
      );
    }

    // Verify captain access
    const hasAccess = await verifyCaptainAccess(fund.id, accessCode);
    if (!hasAccess) {
      logger.warn('Invalid captain access code', { tripId, fundId: fund.id });
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid access code.' },
        },
        { status: 401 }
      );
    }

    logger.info('Fetching fund summary by trip', { tripId, fundId: fund.id });

    // Get full summary
    const summary = await getFundSummary(fund.id);
    if (!summary) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Fund not found.' },
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
    return errorResponse(error, 'Failed to fetch fund.');
  }
}
