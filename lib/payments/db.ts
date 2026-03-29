/**
 * Payment Database Operations
 */

import { getDb } from '../db';
import { Errors } from '../errors';
import {
  TripFund,
  Payment,
  PaymentRequest,
  CreateFundInput,
  CreatePaymentInput,
  CreatePaymentRequestInput,
  FundSummary,
  PaymentRequestWithContext,
  PaymentStatus,
  PaymentRequestStatus,
} from './types';

/**
 * Generate a random access code
 */
function generateAccessCode(): string {
  return `${Date.now().toString(36)}_${crypto.randomUUID().substring(0, 12)}`;
}

/**
 * Generate a unique request code
 */
function generateRequestCode(): string {
  return `pay_${crypto.randomUUID().substring(0, 16)}`;
}

// ============ FUND OPERATIONS ============

/**
 * Create a new trip fund
 */
export async function createFund(input: CreateFundInput): Promise<TripFund> {
  const db = getDb();
  const captainAccessCode = generateAccessCode();

  try {
    const result = await db`
      INSERT INTO trip_funds (
        trip_id, name, target_amount_per_person, target_total,
        fund_type, description, due_date, captain_email, captain_access_code
      ) VALUES (
        ${input.trip_id},
        ${input.name || 'Trip Fund'},
        ${input.target_amount_per_person || null},
        ${input.target_total || null},
        ${input.fund_type},
        ${input.description || null},
        ${input.due_date || null},
        ${input.captain_email},
        ${captainAccessCode}
      ) RETURNING *
    `;
    return result[0] as TripFund;
  } catch (error) {
    console.error('Error creating fund:', error);
    throw Errors.databaseError('createFund', error instanceof Error ? error : undefined);
  }
}

/**
 * Get fund by ID
 */
export async function getFundById(fundId: string): Promise<TripFund | null> {
  const db = getDb();
  try {
    const result = await db`
      SELECT * FROM trip_funds WHERE id = ${fundId}
    `;
    return (result[0] as TripFund) || null;
  } catch (error) {
    console.error('Error getting fund:', error);
    throw Errors.databaseError('getFundById', error instanceof Error ? error : undefined);
  }
}

/**
 * Get fund by trip ID
 */
export async function getFundByTripId(tripId: string): Promise<TripFund | null> {
  const db = getDb();
  try {
    const result = await db`
      SELECT * FROM trip_funds WHERE trip_id = ${tripId}
    `;
    return (result[0] as TripFund) || null;
  } catch (error) {
    console.error('Error getting fund by trip:', error);
    throw Errors.databaseError('getFundByTripId', error instanceof Error ? error : undefined);
  }
}

/**
 * Verify captain access code
 */
export async function verifyCaptainAccess(fundId: string, accessCode: string): Promise<boolean> {
  const db = getDb();
  try {
    const result = await db`
      SELECT id FROM trip_funds
      WHERE id = ${fundId} AND captain_access_code = ${accessCode}
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Error verifying captain access:', error);
    return false;
  }
}

/**
 * Update fund settings
 */
export async function updateFund(
  fundId: string,
  updates: Partial<Pick<TripFund, 'name' | 'target_amount_per_person' | 'target_total' | 'description' | 'due_date'>>
): Promise<TripFund | null> {
  const db = getDb();
  try {
    const result = await db`
      UPDATE trip_funds SET
        name = COALESCE(${updates.name}, name),
        target_amount_per_person = COALESCE(${updates.target_amount_per_person}, target_amount_per_person),
        target_total = COALESCE(${updates.target_total}, target_total),
        description = COALESCE(${updates.description}, description),
        due_date = COALESCE(${updates.due_date}, due_date),
        updated_at = NOW()
      WHERE id = ${fundId}
      RETURNING *
    `;
    return (result[0] as TripFund) || null;
  } catch (error) {
    console.error('Error updating fund:', error);
    throw Errors.databaseError('updateFund', error instanceof Error ? error : undefined);
  }
}

// ============ PAYMENT OPERATIONS ============

/**
 * Create a payment record
 */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const db = getDb();
  try {
    const result = await db`
      INSERT INTO payments (
        fund_id, trip_id, payer_email, payer_name,
        amount, payment_type, stripe_checkout_session_id, status
      ) VALUES (
        ${input.fund_id},
        ${input.trip_id},
        ${input.payer_email},
        ${input.payer_name},
        ${input.amount},
        ${input.payment_type},
        ${input.stripe_checkout_session_id || null},
        'pending'
      ) RETURNING *
    `;
    return result[0] as Payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw Errors.databaseError('createPayment', error instanceof Error ? error : undefined);
  }
}

/**
 * Update payment status (typically from webhook)
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  stripePaymentIntentId?: string
): Promise<Payment | null> {
  const db = getDb();
  try {
    const result = await db`
      UPDATE payments SET
        status = ${status},
        stripe_payment_intent_id = COALESCE(${stripePaymentIntentId || null}, stripe_payment_intent_id),
        paid_at = ${status === 'completed' ? new Date().toISOString() : null}
      WHERE id = ${paymentId}
      RETURNING *
    `;
    return (result[0] as Payment) || null;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw Errors.databaseError('updatePaymentStatus', error instanceof Error ? error : undefined);
  }
}

/**
 * Update payment by checkout session ID
 */
export async function updatePaymentByCheckoutSession(
  sessionId: string,
  status: PaymentStatus,
  paymentIntentId?: string
): Promise<Payment | null> {
  const db = getDb();
  try {
    const result = await db`
      UPDATE payments SET
        status = ${status},
        stripe_payment_intent_id = COALESCE(${paymentIntentId || null}, stripe_payment_intent_id),
        paid_at = ${status === 'completed' ? new Date().toISOString() : null}
      WHERE stripe_checkout_session_id = ${sessionId}
      RETURNING *
    `;
    return (result[0] as Payment) || null;
  } catch (error) {
    console.error('Error updating payment by session:', error);
    throw Errors.databaseError('updatePaymentByCheckoutSession', error instanceof Error ? error : undefined);
  }
}

/**
 * Get payments for a fund
 */
export async function getPaymentsByFund(fundId: string): Promise<Payment[]> {
  const db = getDb();
  try {
    const result = await db`
      SELECT * FROM payments
      WHERE fund_id = ${fundId}
      ORDER BY created_at DESC
    `;
    return result as Payment[];
  } catch (error) {
    console.error('Error getting payments:', error);
    throw Errors.databaseError('getPaymentsByFund', error instanceof Error ? error : undefined);
  }
}

// ============ PAYMENT REQUEST OPERATIONS ============

/**
 * Create a payment request
 */
export async function createPaymentRequest(input: CreatePaymentRequestInput): Promise<PaymentRequest> {
  const db = getDb();
  const requestCode = generateRequestCode();

  try {
    const result = await db`
      INSERT INTO payment_requests (
        fund_id, email, name, amount, request_code, status
      ) VALUES (
        ${input.fund_id},
        ${input.email},
        ${input.name || null},
        ${input.amount},
        ${requestCode},
        'pending'
      ) RETURNING *
    `;
    return result[0] as PaymentRequest;
  } catch (error) {
    console.error('Error creating payment request:', error);
    throw Errors.databaseError('createPaymentRequest', error instanceof Error ? error : undefined);
  }
}

/**
 * Get payment request by code
 */
export async function getPaymentRequestByCode(requestCode: string): Promise<PaymentRequest | null> {
  const db = getDb();
  try {
    const result = await db`
      SELECT * FROM payment_requests WHERE request_code = ${requestCode}
    `;
    return (result[0] as PaymentRequest) || null;
  } catch (error) {
    console.error('Error getting payment request:', error);
    throw Errors.databaseError('getPaymentRequestByCode', error instanceof Error ? error : undefined);
  }
}

/**
 * Get payment request with full context
 */
export async function getPaymentRequestWithContext(requestCode: string): Promise<PaymentRequestWithContext | null> {
  const db = getDb();
  try {
    const result = await db`
      SELECT
        pr.*,
        tf.id as fund_id,
        tf.name as fund_name,
        tf.trip_id,
        tf.captain_email,
        tf.fund_type,
        tf.description as fund_description,
        t.trip_name
      FROM payment_requests pr
      JOIN trip_funds tf ON pr.fund_id = tf.id
      JOIN trips t ON tf.trip_id = t.id
      WHERE pr.request_code = ${requestCode}
    `;

    if (result.length === 0) return null;

    const row = result[0] as Record<string, unknown>;
    return {
      id: row.id as string,
      fund_id: row.fund_id as string,
      email: row.email as string,
      name: row.name as string | null,
      amount: row.amount as number,
      request_code: row.request_code as string,
      status: row.status as PaymentRequestStatus,
      sent_at: row.sent_at as string,
      paid_at: row.paid_at as string | null,
      fund: {
        id: row.fund_id as string,
        trip_id: row.trip_id as string,
        name: row.fund_name as string,
        target_amount_per_person: null,
        target_total: null,
        fund_type: row.fund_type as 'dues' | 'shared' | 'both',
        description: row.fund_description as string | null,
        due_date: null,
        captain_email: row.captain_email as string,
        captain_access_code: '',
        stripe_product_id: null,
        created_at: '',
        updated_at: '',
      },
      trip_name: row.trip_name as string,
      trip_id: row.trip_id as string,
    };
  } catch (error) {
    console.error('Error getting payment request with context:', error);
    throw Errors.databaseError('getPaymentRequestWithContext', error instanceof Error ? error : undefined);
  }
}

/**
 * Update payment request status
 */
export async function updatePaymentRequestStatus(
  requestCode: string,
  status: PaymentRequestStatus
): Promise<PaymentRequest | null> {
  const db = getDb();
  try {
    const result = await db`
      UPDATE payment_requests SET
        status = ${status},
        paid_at = ${status === 'paid' ? new Date().toISOString() : null}
      WHERE request_code = ${requestCode}
      RETURNING *
    `;
    return (result[0] as PaymentRequest) || null;
  } catch (error) {
    console.error('Error updating payment request:', error);
    throw Errors.databaseError('updatePaymentRequestStatus', error instanceof Error ? error : undefined);
  }
}

/**
 * Get payment requests for a fund
 */
export async function getPaymentRequestsByFund(fundId: string): Promise<PaymentRequest[]> {
  const db = getDb();
  try {
    const result = await db`
      SELECT * FROM payment_requests
      WHERE fund_id = ${fundId}
      ORDER BY sent_at DESC
    `;
    return result as PaymentRequest[];
  } catch (error) {
    console.error('Error getting payment requests:', error);
    throw Errors.databaseError('getPaymentRequestsByFund', error instanceof Error ? error : undefined);
  }
}

// ============ SUMMARY OPERATIONS ============

/**
 * Get fund summary with all payments and stats
 */
export async function getFundSummary(fundId: string): Promise<FundSummary | null> {
  const fund = await getFundById(fundId);
  if (!fund) return null;

  const payments = await getPaymentsByFund(fundId);
  const requests = await getPaymentRequestsByFund(fundId);

  const completedPayments = payments.filter(p => p.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const totalCollected = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const targetAmount = fund.target_total || fund.target_amount_per_person;
  const progressPercent = targetAmount
    ? Math.min(100, Math.round((totalCollected / targetAmount) * 100))
    : null;

  return {
    fund,
    payments,
    requests,
    stats: {
      total_collected: totalCollected,
      total_pending: totalPending,
      payment_count: completedPayments.length,
      pending_request_count: pendingRequests.length,
      target_amount: targetAmount,
      progress_percent: progressPercent,
    },
  };
}
