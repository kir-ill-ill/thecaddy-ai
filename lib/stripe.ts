/**
 * Stripe Client Configuration
 * Server-side Stripe SDK setup
 */

import Stripe from 'stripe';

// Validate environment variables
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return key;
}

// Lazy initialization of Stripe client
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return _stripe;
}

// Webhook signature verification
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }
  return secret;
}

// Public key for client-side
export function getPublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is not set');
  }
  return key;
}

/**
 * Create a Stripe Checkout session for a payment
 */
export async function createCheckoutSession(params: {
  amount: number; // in cents
  currency?: string;
  customerEmail: string;
  customerName: string;
  tripName: string;
  fundName: string;
  paymentRequestId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency || 'usd',
          product_data: {
            name: params.fundName,
            description: `Payment for ${params.tripName}`,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      payment_request_id: params.paymentRequestId,
      customer_name: params.customerName,
      ...params.metadata,
    },
    payment_intent_data: {
      metadata: {
        payment_request_id: params.paymentRequestId,
        customer_name: params.customerName,
        ...params.metadata,
      },
    },
  });

  return session;
}

/**
 * Verify webhook signature and parse event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Retrieve a checkout session with expanded payment intent
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  });
}

/**
 * Format amount from cents to dollars for display
 */
export function formatAmount(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
}

/**
 * Parse amount from dollars to cents
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Parse amount from cents to dollars
 */
export function toDollars(cents: number): number {
  return cents / 100;
}
