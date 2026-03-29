/**
 * Payment Types for CaddyAI
 */

// Fund types
export type FundType = 'dues' | 'shared' | 'both';

// Payment types
export type PaymentType = 'dues' | 'contribution';

// Payment status
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Payment request status
export type PaymentRequestStatus = 'pending' | 'paid' | 'cancelled';

/**
 * Trip Fund - configuration for collecting payments
 */
export interface TripFund {
  id: string;
  trip_id: string;
  name: string;
  target_amount_per_person: number | null; // in cents
  target_total: number | null; // in cents
  fund_type: FundType;
  description: string | null;
  due_date: string | null;
  captain_email: string;
  captain_access_code: string;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payment record
 */
export interface Payment {
  id: string;
  fund_id: string;
  trip_id: string;
  payer_email: string;
  payer_name: string;
  amount: number; // in cents
  payment_type: PaymentType;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

/**
 * Payment request sent to a group member
 */
export interface PaymentRequest {
  id: string;
  fund_id: string;
  email: string;
  name: string | null;
  amount: number; // in cents
  request_code: string;
  status: PaymentRequestStatus;
  sent_at: string;
  paid_at: string | null;
}

/**
 * Input types for creating records
 */
export interface CreateFundInput {
  trip_id: string;
  name?: string;
  target_amount_per_person?: number;
  target_total?: number;
  fund_type: FundType;
  description?: string;
  due_date?: string;
  captain_email: string;
}

export interface CreatePaymentInput {
  fund_id: string;
  trip_id: string;
  payer_email: string;
  payer_name: string;
  amount: number;
  payment_type: PaymentType;
  stripe_checkout_session_id?: string;
}

export interface CreatePaymentRequestInput {
  fund_id: string;
  email: string;
  name?: string;
  amount: number;
}

/**
 * Fund summary with payment stats
 */
export interface FundSummary {
  fund: TripFund;
  payments: Payment[];
  requests: PaymentRequest[];
  stats: {
    total_collected: number;
    total_pending: number;
    payment_count: number;
    pending_request_count: number;
    target_amount: number | null;
    progress_percent: number | null;
  };
}

/**
 * Payment request with fund context
 */
export interface PaymentRequestWithContext extends PaymentRequest {
  fund: TripFund;
  trip_name: string;
  trip_id: string;
}
