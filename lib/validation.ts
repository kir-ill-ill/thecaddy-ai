/**
 * CaddyAI Input Validation Schemas
 * Uses Zod for type-safe runtime validation
 */

import { z } from 'zod';

// Common validation patterns
const positiveInt = z.number().int().positive();
const positiveNumber = z.number().positive();

// US States
const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

// Trip vibes (matching lib/types.ts)
const vibes = ['competitive', 'casual', 'competitive_fun', 'mixed'] as const;

// Budget scopes
const budgetScopes = ['golf_only', 'golf_lodging', 'all_inclusive', 'unknown'] as const;

// Travel modes
const travelModes = ['drive', 'fly', 'either'] as const;

// Lodging preferences
const lodgingPrefs = ['resort', 'airbnb', 'budget', 'any'] as const;

// Golf density
const golfDensities = ['18_per_day', '36_per_day', '27_per_day', 'flexible'] as const;

// Tee time preferences
const teeTimePrefs = ['early_morning', 'mid_morning', 'afternoon', 'any'] as const;

// Lodging types
const lodgingTypes = ['resort', 'hotel', 'airbnb', 'vacation_rental', 'condo'] as const;

/**
 * Trip Planning Request Schema
 */
export const TripBriefSchema = z.object({
  tripName: z.string().min(1).max(200).trim(),
  originCity: z.string().min(1).max(100).trim(),
  originState: z.enum(usStates),
  players: z.number().int().min(1).max(24),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  nights: z.number().int().min(1).max(14),
  budgetPerPerson: z.number().min(100).max(50000),
  budgetScope: z.enum(budgetScopes).optional().default('unknown'),
  vibe: z.enum(vibes).optional().default('competitive_fun'),
  travelMode: z.enum(travelModes).optional().default('drive'),
  lodgingPref: z.enum(lodgingPrefs).optional().default('any'),
  golfDensity: z.enum(golfDensities).optional().default('18_per_day'),
  teeTimePref: z.enum(teeTimePrefs).optional().default('mid_morning'),
  maxDriveHours: z.number().min(1).max(12).optional().default(4),
  captainEmail: z.string().email().optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

export type TripBrief = z.infer<typeof TripBriefSchema>;

/**
 * Destination Search Schema
 */
export const DestinationSearchSchema = z.object({
  originCity: z.string().min(1).max(100).trim().optional(),
  originState: z.enum(usStates).optional(),
  maxDriveHours: z.number().min(1).max(12).optional(),
});

export type DestinationSearch = z.infer<typeof DestinationSearchSchema>;

/**
 * Course Query Schema
 */
export const CourseQuerySchema = z.object({
  destinationId: positiveInt.optional(),
  top: positiveInt.max(100).optional(),
});

export type CourseQuery = z.infer<typeof CourseQuerySchema>;

/**
 * Lodging Query Schema
 */
export const LodgingQuerySchema = z.object({
  destinationId: positiveInt,
  type: z.enum(lodgingTypes).optional(),
});

export type LodgingQuery = z.infer<typeof LodgingQuerySchema>;

/**
 * Vote Request Schema
 */
export const VoteRequestSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().optional(),
  canMakeDates: z.array(z.string()).optional(),
  budgetOk: z.boolean().optional(),
  maxBudget: positiveNumber.optional(),
  lodgingPref: z.enum(lodgingPrefs).optional(),
  preferredOptionId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
});

export type VoteRequest = z.infer<typeof VoteRequestSchema>;

/**
 * ID Parameter Schema
 */
export const IdParamSchema = z.object({
  id: z.string().min(1),
});

/**
 * Numeric ID Schema
 */
export const NumericIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Pagination Schema
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Helper to parse search params into an object
 */
export function parseSearchParams(searchParams: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Safely parse and validate input, returning a result object
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  return errors;
}

// Types matching lib/types.ts TripBrief structure
const skillMix = ['unknown', 'beginner_heavy', 'mixed', 'experienced_heavy'] as const;
const apiTravelModes = ['drive', 'fly', 'either'] as const;
const apiLodgingTypes = ['house', 'hotel', 'resort', 'house_or_resort', 'any', 'tbd'] as const;
const apiGolfDensity = ['18_per_day', '36_one_day_ok', '36_daily', 'flex'] as const;
const apiTeeTime = ['early', 'mid_morning', 'noon', 'flex'] as const;
const apiBudgetScope = ['all_in', 'golf_only', 'unknown'] as const;

/**
 * TripBrief API Schema - matches lib/types.ts TripBrief
 */
export const TripBriefAPISchema = z.object({
  schema_version: z.literal('1.0'),
  trip_name: z.string().min(1).max(200).trim().optional(),
  origin: z.object({
    city: z.string().min(1).max(100).trim(),
    state: z.string().min(2).max(50),
    zip: z.string().optional(),
  }),
  party: z.object({
    players: z.number().int().min(1).max(24),
    skill_mix: z.enum(skillMix).optional(),
  }),
  dates: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    nights: z.number().int().min(1).max(14),
    flex_days: z.number().int().min(0).max(7),
  }),
  budget: z.object({
    per_person: z.number().min(100).max(50000),
    scope: z.enum(apiBudgetScope),
    currency: z.string().optional(),
  }),
  preferences: z.object({
    vibe: z.enum(vibes),
    travel_mode: z.enum(apiTravelModes),
    lodging: z.enum(apiLodgingTypes),
    golf_density: z.enum(apiGolfDensity),
    tee_time: z.enum(apiTeeTime),
  }),
  constraints: z.object({
    avoid: z.array(z.string()).default([]),
    must_have: z.array(z.string()).default([]),
    max_drive_hours: z.number().min(1).max(12).optional(),
  }),
  assumptions: z.array(z.string()).default([]),
}).refine(
  (data) => new Date(data.dates.end) > new Date(data.dates.start),
  { message: 'End date must be after start date', path: ['dates', 'end'] }
);

export type TripBriefAPI = z.infer<typeof TripBriefAPISchema>;

/**
 * Plan Request Schema - for POST /api/plan
 */
export const PlanRequestSchema = z.object({
  trip_brief: TripBriefAPISchema,
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
