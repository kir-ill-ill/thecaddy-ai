import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCaptainAccess,
  getFundById,
  createPaymentRequest,
  getPaymentRequestsByFund,
} from '@/lib/payments';
import { CreatePaymentRequestSchema } from '@/lib/payments/validation';
import { validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/funds/[fundId]/requests - Get all payment requests for a fund
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
          error: { code: 'UNAUTHORIZED', message: 'Access code is required.' },
        },
        { status: 401 }
      );
    }

    const hasAccess = await verifyCaptainAccess(fundId, accessCode);
    if (!hasAccess) {
      logger.warn('Invalid captain access code', { fundId });
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid access code.' },
        },
        { status: 401 }
      );
    }

    logger.info('Fetching payment requests', { fundId });

    const requests = await getPaymentRequestsByFund(fundId);

    return NextResponse.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Requests fetch error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to fetch payment requests.');
  }
}

// POST /api/funds/[fundId]/requests - Create payment requests
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ fundId: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { fundId } = await params;
    const body = await req.json();

    // Extract access code
    const accessCode = body.access_code;
    if (!accessCode) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Access code is required.' },
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
          error: { code: 'UNAUTHORIZED', message: 'Invalid access code.' },
        },
        { status: 401 }
      );
    }

    // Validate request data
    const validation = validateInput(CreatePaymentRequestSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    // Get fund to verify it exists
    const fund = await getFundById(fundId);
    if (!fund) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Fund not found.' },
        },
        { status: 404 }
      );
    }

    logger.info('Creating payment requests', {
      fundId,
      count: validation.data.requests.length,
    });

    // Create all payment requests
    const createdRequests = await Promise.all(
      validation.data.requests.map((req) =>
        createPaymentRequest({
          fund_id: fundId,
          email: req.email,
          name: req.name,
          amount: req.amount,
        })
      )
    );

    // Generate payment URLs
    const requestsWithUrls = createdRequests.map((request) => ({
      ...request,
      payment_url: `/pay/${request.request_code}`,
    }));

    logger.info('Payment requests created', { count: createdRequests.length });

    return NextResponse.json({
      success: true,
      data: { requests: requestsWithUrls },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Request creation error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to create payment requests.');
  }
}
