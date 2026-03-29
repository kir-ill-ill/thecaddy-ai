import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { CaddyError, ErrorCode, Errors } from './errors';

// Environment validation
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new CaddyError(
      ErrorCode.DATABASE_ERROR,
      'DATABASE_URL environment variable is not set',
      'Database configuration error. Please contact support.',
      500
    );
  }
  return url;
}

// Lazy initialization of database connection
let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    _sql = neon(getDatabaseUrl());
  }
  return _sql;
}

// For backwards compatibility
export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return getDb()(args[0] as TemplateStringsArray, ...args.slice(1));
  },
  get(_target, prop) {
    const db = getDb();
    return (db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Wrap database operations with error handling
 */
async function dbQuery<T>(
  operation: string,
  queryFn: () => Promise<T>
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`Database error in ${operation}:`, error);
    throw Errors.databaseError(operation, error instanceof Error ? error : undefined);
  }
}

// Types matching our database schema
export interface Destination {
  id: number;
  name: string;
  region: string;
  state: string;
  description: string | null;
  vibe: string[];
  avg_green_fee_low: number | null;
  avg_green_fee_high: number | null;
  avg_lodging_per_night: number | null;
  best_months: number[];
  lat: number | null;
  lng: number | null;
}

export interface Course {
  id: number;
  name: string;
  destination_id: number | null;
  city: string;
  state: string;
  lat: number;
  lng: number;
  holes: number;
  par: number;
  slope_rating: number | null;
  course_rating: number | null;
  quality_score: number | null;
  green_fee_weekday: number | null;
  green_fee_weekend: number | null;
  cart_included: boolean;
  walking_allowed: boolean;
  resort_course: boolean;
  public_course: boolean;
  course_type: string | null;
  designer: string | null;
  year_built: number | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  amenities: string[];
}

export interface Lodging {
  id: number;
  name: string;
  destination_id: number | null;
  lodging_type: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  price_per_night_low: number | null;
  price_per_night_high: number | null;
  sleeps: number | null;
  bedrooms: number | null;
  has_golf_course: boolean;
  amenities: string[];
  description: string | null;
}

// Query functions
export async function getDestinations(): Promise<Destination[]> {
  return dbQuery('getDestinations', async () => {
    const db = getDb();
    const results = await db`SELECT * FROM destinations ORDER BY name`;
    return results as Destination[];
  });
}

export async function getDestinationById(id: number): Promise<Destination | null> {
  return dbQuery('getDestinationById', async () => {
    const db = getDb();
    const results = await db`SELECT * FROM destinations WHERE id = ${id}`;
    return (results[0] as Destination) || null;
  });
}

export async function getDestinationsByState(state: string): Promise<Destination[]> {
  return dbQuery('getDestinationsByState', async () => {
    const db = getDb();
    const results = await db`SELECT * FROM destinations WHERE state = ${state} ORDER BY name`;
    return results as Destination[];
  });
}

export async function getCoursesByDestination(destinationId: number): Promise<Course[]> {
  return dbQuery('getCoursesByDestination', async () => {
    const db = getDb();
    const results = await db`
      SELECT * FROM courses
      WHERE destination_id = ${destinationId}
      ORDER BY quality_score DESC NULLS LAST
    `;
    return results as Course[];
  });
}

export async function getCoursesByState(state: string): Promise<Course[]> {
  return dbQuery('getCoursesByState', async () => {
    const db = getDb();
    const results = await db`
      SELECT * FROM courses
      WHERE state = ${state}
      ORDER BY quality_score DESC NULLS LAST
    `;
    return results as Course[];
  });
}

export async function getTopCourses(limit: number = 20): Promise<Course[]> {
  return dbQuery('getTopCourses', async () => {
    const db = getDb();
    const safeLimit = Math.min(Math.max(1, limit), 100); // Clamp between 1-100
    const results = await db`
      SELECT * FROM courses
      ORDER BY quality_score DESC NULLS LAST
      LIMIT ${safeLimit}
    `;
    return results as Course[];
  });
}

export async function getLodgingByDestination(destinationId: number): Promise<Lodging[]> {
  return dbQuery('getLodgingByDestination', async () => {
    const db = getDb();
    const results = await db`
      SELECT * FROM lodging
      WHERE destination_id = ${destinationId}
      ORDER BY price_per_night_low ASC NULLS LAST
    `;
    return results as Lodging[];
  });
}

export async function getLodgingByType(destinationId: number, lodgingType: string): Promise<Lodging[]> {
  return dbQuery('getLodgingByType', async () => {
    const db = getDb();
    const results = await db`
      SELECT * FROM lodging
      WHERE destination_id = ${destinationId}
      AND lodging_type = ${lodgingType}
      ORDER BY price_per_night_low ASC NULLS LAST
    `;
    return results as Lodging[];
  });
}

// Search destinations by budget and travel constraints
export async function searchDestinations(params: {
  maxDriveHours?: number;
  originLat?: number;
  originLng?: number;
  budgetPerPerson?: number;
  nights?: number;
  players?: number;
  vibe?: string;
}): Promise<Destination[]> {
  return dbQuery('searchDestinations', async () => {
    const db = getDb();
    // For now, return all destinations - we'll filter in the planner
    const results = await db`SELECT * FROM destinations ORDER BY name`;
    return results as Destination[];
  });
}

// Get all courses with their destination info
export async function getCoursesWithDestination(): Promise<(Course & { destination_name: string })[]> {
  return dbQuery('getCoursesWithDestination', async () => {
    const db = getDb();
    const results = await db`
      SELECT c.*, d.name as destination_name
      FROM courses c
      LEFT JOIN destinations d ON c.destination_id = d.id
      ORDER BY c.quality_score DESC NULLS LAST
    `;
    return results as (Course & { destination_name: string })[];
  });
}

// Trip types
export interface Trip {
  id: string;
  trip_name: string;
  origin_city: string;
  origin_state: string;
  players: number;
  start_date: string;
  end_date: string;
  nights: number;
  budget_per_person: number;
  budget_scope: string;
  vibe: string;
  travel_mode: string;
  lodging_pref: string;
  golf_density: string;
  tee_time_pref: string;
  max_drive_hours: number;
  captain_email: string | null;
  share_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TripOption {
  id: string;
  trip_id: string;
  option_code: string;
  title: string;
  tagline: string;
  destination_id: number;
  destination_name: string;
  cost_per_person: number;
  cost_lodging: number;
  cost_golf: number;
  cost_food: number;
  cost_transport: number;
  score_total: number;
  score_budget_fit: number;
  score_travel_fit: number;
  score_logistics: number;
  score_vibe_match: number;
  score_course_quality: number;
  why_it_fits: string[];
  rank: number;
}

export interface GroupResponse {
  id: number;
  trip_id: string;
  name: string;
  email: string | null;
  can_make_dates: string[];
  budget_ok: boolean | null;
  max_budget: number | null;
  lodging_pref: string | null;
  preferred_option_id: string | null;
  notes: string | null;
  responded_at: string;
}

export type CreateTripInput = {
  trip_name: string;
  origin_city: string;
  origin_state: string;
  players: number;
  start_date: string;
  end_date: string;
  nights: number;
  budget_per_person: number;
  budget_scope?: string;
  vibe?: string;
  travel_mode?: string;
  lodging_pref?: string;
  golf_density?: string;
  tee_time_pref?: string;
  max_drive_hours?: number;
  captain_email?: string;
};

export type SaveTripOptionInput = {
  trip_id: string;
  option_code: string;
  title: string;
  tagline?: string;
  destination_id: number;
  destination_name: string;
  cost_per_person?: number;
  cost_lodging?: number;
  cost_golf?: number;
  cost_food?: number;
  cost_transport?: number;
  score_total?: number;
  score_budget_fit?: number;
  score_travel_fit?: number;
  score_logistics?: number;
  score_vibe_match?: number;
  score_course_quality?: number;
  why_it_fits?: string[];
  rank?: number;
};

export type SaveGroupResponseInput = {
  trip_id: string;
  name: string;
  email?: string;
  can_make_dates?: string[];
  budget_ok?: boolean;
  max_budget?: number;
  lodging_pref?: string;
  preferred_option_id?: string;
  notes?: string;
};

// Trip storage functions
export async function createTrip(trip: CreateTripInput): Promise<string> {
  return dbQuery('createTrip', async () => {
    const db = getDb();
    // Generate a cryptographically random share code
    const shareCode = `${Date.now().toString(36)}_${crypto.randomUUID().substring(0, 8)}`;

    const result = await db`
      INSERT INTO trips (
        trip_name, origin_city, origin_state, players,
        start_date, end_date, nights, budget_per_person,
        budget_scope, vibe, travel_mode, lodging_pref,
        golf_density, tee_time_pref, max_drive_hours,
        captain_email, share_code, status
      ) VALUES (
        ${trip.trip_name}, ${trip.origin_city}, ${trip.origin_state}, ${trip.players},
        ${trip.start_date}, ${trip.end_date}, ${trip.nights}, ${trip.budget_per_person},
        ${trip.budget_scope || 'unknown'}, ${trip.vibe || 'competitive_fun'},
        ${trip.travel_mode || 'drive'}, ${trip.lodging_pref || 'any'},
        ${trip.golf_density || '18_per_day'}, ${trip.tee_time_pref || 'mid_morning'},
        ${trip.max_drive_hours || 4}, ${trip.captain_email || null}, ${shareCode}, 'draft'
      ) RETURNING id
    `;

    return result[0].id;
  });
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  return dbQuery('getTripById', async () => {
    const db = getDb();
    const results = await db`SELECT * FROM trips WHERE id = ${tripId}`;
    return (results[0] as Trip) || null;
  });
}

export async function getTripByShareCode(shareCode: string): Promise<Trip | null> {
  return dbQuery('getTripByShareCode', async () => {
    const db = getDb();
    const results = await db`SELECT * FROM trips WHERE share_code = ${shareCode}`;
    return (results[0] as Trip) || null;
  });
}

export async function saveTripOption(option: SaveTripOptionInput): Promise<string> {
  return dbQuery('saveTripOption', async () => {
    const db = getDb();
    const result = await db`
      INSERT INTO trip_options (
        trip_id, option_code, title, tagline, destination_id, destination_name,
        cost_per_person, cost_lodging, cost_golf, cost_food, cost_transport,
        score_total, score_budget_fit, score_travel_fit, score_logistics,
        score_vibe_match, score_course_quality, why_it_fits, rank
      ) VALUES (
        ${option.trip_id}, ${option.option_code}, ${option.title}, ${option.tagline || ''},
        ${option.destination_id}, ${option.destination_name},
        ${option.cost_per_person || 0}, ${option.cost_lodging || 0}, ${option.cost_golf || 0},
        ${option.cost_food || 0}, ${option.cost_transport || 0},
        ${option.score_total || 0}, ${option.score_budget_fit || 0}, ${option.score_travel_fit || 0},
        ${option.score_logistics || 0}, ${option.score_vibe_match || 0}, ${option.score_course_quality || 0},
        ${option.why_it_fits || []}, ${option.rank || 1}
      ) RETURNING id
    `;

    return result[0].id;
  });
}

export async function getTripOptions(tripId: string): Promise<TripOption[]> {
  return dbQuery('getTripOptions', async () => {
    const db = getDb();
    const results = await db`
      SELECT * FROM trip_options
      WHERE trip_id = ${tripId}
      ORDER BY rank ASC
    `;
    return results as TripOption[];
  });
}

export async function saveGroupResponse(response: SaveGroupResponseInput): Promise<number> {
  return dbQuery('saveGroupResponse', async () => {
    const db = getDb();
    const result = await db`
      INSERT INTO group_responses (
        trip_id, name, email, can_make_dates, budget_ok,
        max_budget, lodging_pref, preferred_option_id, notes
      ) VALUES (
        ${response.trip_id}, ${response.name}, ${response.email || null},
        ${response.can_make_dates || []}, ${response.budget_ok ?? null},
        ${response.max_budget || null}, ${response.lodging_pref || null},
        ${response.preferred_option_id || null}, ${response.notes || null}
      ) RETURNING id
    `;

    return result[0].id;
  });
}

export async function getGroupResponses(tripId: string): Promise<GroupResponse[]> {
  return dbQuery('getGroupResponses', async () => {
    const db = getDb();
    const results = await db`
      SELECT * FROM group_responses
      WHERE trip_id = ${tripId}
      ORDER BY responded_at DESC
    `;
    return results as GroupResponse[];
  });
}

export async function updateTripStatus(tripId: string, status: string): Promise<void> {
  return dbQuery('updateTripStatus', async () => {
    const db = getDb();
    await db`
      UPDATE trips
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${tripId}
    `;
  });
}
