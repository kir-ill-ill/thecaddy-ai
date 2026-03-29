import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequestWithContext } from '@/lib/payments';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';
import { formatAmount } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// GET /api/payments/[requestCode] - Get payment request details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestCode: string }> }
) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const { requestCode } = await params;

    logger.info('Fetching payment request', { requestCode });

    const paymentRequest = await getPaymentRequestWithContext(requestCode);
    if (!paymentRequest) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Payment request not found.' },
        },
        { status: 404 }
      );
    }

    // Format response (hide sensitive fund data)
    const response = {
      id: paymentRequest.id,
      email: paymentRequest.email,
      name: paymentRequest.name,
      amount: paymentRequest.amount,
      amount_formatted: formatAmount(paymentRequest.amount),
      request_code: paymentRequest.request_code,
      status: paymentRequest.status,
      sent_at: paymentRequest.sent_at,
      paid_at: paymentRequest.paid_at,
      fund: {
        id: paymentRequest.fund.id,
        name: paymentRequest.fund.name,
        description: paymentRequest.fund.description,
        fund_type: paymentRequest.fund.fund_type,
      },
      trip_name: paymentRequest.trip_name,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Payment request fetch error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to fetch payment request.');
  }
}
