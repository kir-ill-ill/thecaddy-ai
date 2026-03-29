import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { constructWebhookEvent, getCheckoutSession } from '@/lib/stripe';
import {
  updatePaymentByCheckoutSession,
  updatePaymentRequestStatus,
  getPaymentRequestByCode,
} from '@/lib/payments';

export const dynamic = 'force-dynamic';

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs';

// POST /api/payments/webhook - Handle Stripe webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Webhook: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  const requestCode = session.metadata?.request_code;
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  // Update payment record
  const payment = await updatePaymentByCheckoutSession(
    session.id,
    'completed',
    paymentIntentId
  );

  if (!payment) {
    console.error('Payment not found for session:', session.id);
    return;
  }

  console.log('Payment updated:', payment.id);

  // Update payment request status
  if (requestCode) {
    const paymentRequest = await updatePaymentRequestStatus(requestCode, 'paid');
    if (paymentRequest) {
      console.log('Payment request marked as paid:', paymentRequest.id);
    }
  }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout expired:', session.id);

  await updatePaymentByCheckoutSession(session.id, 'failed');
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  // Find and update the payment by looking up via session metadata
  // Since payment_intent might be connected to the session
  const requestCode = paymentIntent.metadata?.request_code;
  if (requestCode) {
    const request = await getPaymentRequestByCode(requestCode);
    if (request) {
      console.log('Payment request still pending:', request.id);
    }
  }
}
