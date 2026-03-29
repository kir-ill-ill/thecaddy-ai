/**
 * Payment Validation Schemas
 */

import { z } from 'zod';

// Fund types
const fundTypes = ['dues', 'shared', 'both'] as const;

// Payment types
const paymentTypes = ['dues', 'contribution'] as const;

/**
 * Create Fund Request Schema
 */
export const CreateFundSchema = z.object({
  trip_id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  target_amount_per_person: z.number().int().min(100).max(10000000).optional(), // 1 cent to $100k
  target_total: z.number().int().min(100).max(10000000).optional(),
  fund_type: z.enum(fundTypes),
  description: z.string().max(1000).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  captain_email: z.string().email(),
}).refine(
  (data) => data.target_amount_per_person || data.target_total,
  { message: 'Either target_amount_per_person or target_total is required' }
);

export type CreateFundRequest = z.infer<typeof CreateFundSchema>;

/**
 * Update Fund Request Schema
 */
export const UpdateFundSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  target_amount_per_person: z.number().int().min(100).max(10000000).optional(),
  target_total: z.number().int().min(100).max(10000000).optional(),
  description: z.string().max(1000).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type UpdateFundRequest = z.infer<typeof UpdateFundSchema>;

/**
 * Create Payment Request Schema (for sending to group members)
 */
export const CreatePaymentRequestSchema = z.object({
  requests: z.array(z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100).optional(),
    amount: z.number().int().min(100).max(10000000), // in cents
  })).min(1).max(50), // Max 50 requests at once
});

export type CreatePaymentRequestsRequest = z.infer<typeof CreatePaymentRequestSchema>;

/**
 * Checkout Session Request Schema
 */
export const CheckoutRequestSchema = z.object({
  request_code: z.string().min(1),
  payer_name: z.string().min(1).max(100),
  payer_email: z.string().email(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

/**
 * Captain Access Verification Schema
 */
export const CaptainAccessSchema = z.object({
  access_code: z.string().min(1),
});

export type CaptainAccessRequest = z.infer<typeof CaptainAccessSchema>;

/**
 * Contribution Request Schema (for shared fund)
 */
export const ContributionRequestSchema = z.object({
  fund_id: z.string().uuid(),
  amount: z.number().int().min(100).max(10000000), // in cents
  payer_name: z.string().min(1).max(100),
  payer_email: z.string().email(),
});

export type ContributionRequest = z.infer<typeof ContributionRequestSchema>;
