import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import {
  getPaymentRequestWithContext,
  createPayment,
} from '@/lib/payments';
import { CheckoutRequestSchema } from '@/lib/payments/validation';
import { validateInput, formatZodErrors } from '@/lib/validation';
import { CaddyError } from '@/lib/errors';
import { errorResponse, generateRequestId, createLogger } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// POST /api/payments/checkout - Create a Stripe Checkout session
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const logger = createLogger(requestId);

  try {
    const body = await req.json();

    // Validate request
    const validation = validateInput(CheckoutRequestSchema, body);
    if (!validation.success) {
      logger.warn('Validation failed', { errors: formatZodErrors(validation.error) });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid checkout request.',
            details: { validationErrors: formatZodErrors(validation.error) },
          },
        },
        { status: 400 }
      );
    }

    const { request_code, payer_name, payer_email } = validation.data;

    // Get payment request with context
    const paymentRequest = await getPaymentRequestWithContext(request_code);
    if (!paymentRequest) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Payment request not found.' },
        },
        { status: 404 }
      );
    }

    // Check if already paid
    if (paymentRequest.status === 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ALREADY_PAID', message: 'This payment request has already been paid.' },
        },
        { status: 400 }
      );
    }

    logger.info('Creating checkout session', {
      requestCode: request_code,
      amount: paymentRequest.amount,
      payerEmail: payer_email,
    });

    // Get base URL for success/cancel redirects
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout session
    const session = await createCheckoutSession({
      amount: paymentRequest.amount,
      customerEmail: payer_email,
      customerName: payer_name,
      tripName: paymentRequest.trip_name,
      fundName: paymentRequest.fund.name,
      paymentRequestId: paymentRequest.id,
      successUrl: `${origin}/pay/${request_code}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pay/${request_code}?cancelled=true`,
      metadata: {
        request_code,
        fund_id: paymentRequest.fund_id,
        trip_id: paymentRequest.trip_id,
      },
    });

    // Create payment record
    await createPayment({
      fund_id: paymentRequest.fund_id,
      trip_id: paymentRequest.trip_id,
      payer_email,
      payer_name,
      amount: paymentRequest.amount,
      payment_type: 'dues',
      stripe_checkout_session_id: session.id,
    });

    logger.info('Checkout session created', { sessionId: session.id });

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: session.url,
        session_id: session.id,
      },
    });
  } catch (error) {
    if (error instanceof CaddyError) {
      logger.error('Checkout error', error, { code: error.code });
      return errorResponse(error);
    }

    logger.error('Unexpected error', error);
    return errorResponse(error, 'Failed to create checkout session.');
  }
}
