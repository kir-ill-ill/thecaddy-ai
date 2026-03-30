// TheCaddy.AI Types - Based on JSON Schema Spec v1.0

export type Vibe = 'competitive' | 'casual' | 'competitive_fun' | 'mixed';
export type TravelMode = 'drive' | 'fly' | 'either';
export type LodgingType = 'house' | 'hotel' | 'resort' | 'house_or_resort' | 'any' | 'tbd';
export type GolfDensity = '18_per_day' | '36_one_day_ok' | '36_daily' | 'flex';
export type TeeTime = 'early' | 'mid_morning' | 'noon' | 'flex';
export type BudgetScope = 'all_in' | 'golf_only' | 'unknown';
export type SkillMix = 'unknown' | 'beginner_heavy' | 'mixed' | 'experienced_heavy';
export type Confidence = 'low' | 'medium' | 'high';
export type CourseRole = 'anchor' | 'value' | 'vibes' | 'backup' | 'tbd';
export type ItineraryType = 'travel' | 'golf' | 'meal' | 'food' | 'activity' | 'nightlife' | 'rest' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high';

// TripBrief - Normalized planning input
export interface TripBrief {
  schema_version: '1.0';
  trip_name?: string;
  destination?: {
    city: string;
    state: string;
  };
  origin: {
    city: string;
    state: string;
    zip?: string;
  };
  party: {
    players: number;
    skill_mix?: SkillMix;
  };
  dates: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    nights?: number;
    flex_days?: number;
  };
  budget: {
    per_person: number;
    scope?: BudgetScope;
    currency?: string;
  };
  preferences: {
    vibe: Vibe;
    travel_mode?: TravelMode;
    lodging: LodgingType;
    golf_density?: GolfDensity;
    tee_time?: TeeTime;
  };
  constraints?: {
    avoid?: string[];
    must_have?: string[];
    max_drive_hours?: number;
  };
  assumptions?: string[];
}

// Extractor Request/Response
export interface ExtractTripBriefRequest {
  schema_version: '1.0';
  user_message: string;
  chat_context: {
    known_trip_brief?: Partial<TripBrief>;
    user_profile?: {
      home_city?: string;
      home_state?: string;
      [key: string]: any;
    };
  };
  locale: string;
  now_date: string;
}

export interface ExtractTripBriefResponse {
  schema_version: '1.0';
  trip_brief: Partial<TripBrief>;
  missing_fields: string[];
  follow_up_question: string | null;
  notes?: string;
}

// Course & Lodging Candidates
export interface CourseCandidate {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  quality_proxy: number;
  notes?: string;
  source?: string;
}

export interface LodgingCandidate {
  name: string;
  type: LodgingType;
  city: string;
  state: string;
  lat: number;
  lng: number;
  price_proxy_per_night?: number | null;
  source?: string;
}

// Trip Options
export interface CoursePick {
  name: string;
  role?: CourseRole;
  holes?: 9 | 18 | 27 | 36;
  difficulty?: string;
  price_range?: string;
  features?: string[];
  notes?: string;
}

export interface LodgingPick {
  type: LodgingType;
  name_or_area: string;
  nights: number;
  notes?: string;
}

export interface ItineraryItem {
  type: ItineraryType;
  label: string;
  time_window: string; // HH:MM-HH:MM
  notes?: string;
}

export interface ItineraryDay {
  day_label?: string;
  day?: string;
  items: ItineraryItem[];
}

export interface CostEstimate {
  per_person_target?: number;
  per_person_estimated: number;
  confidence?: Confidence;
  breakdown?: {
    lodging: number;
    golf: number;
    food: number;
    local_transport?: number;
    misc?: number;
  };
  assumptions?: string[];
}

export interface ScoreBreakdown {
  total: number;
  budget_fit: number;
  travel_fit: number;
  logistics: number;
  vibe_match: number;
  course_quality_proxy: number;
}

export interface TripOption {
  id: string; // opt_*
  title: string;
  tagline?: string;
  destination: string;
  need_research?: boolean;
  courses: CoursePick[];
  lodging: LodgingPick;
  itinerary?: ItineraryDay[];
  cost_estimate: CostEstimate;
  score_breakdown?: ScoreBreakdown;
  why_it_fits: string[];
}

// Planner Request/Response
export interface PlanTripOptionsRequest {
  schema_version: '1.0';
  trip_brief: TripBrief;
  inventory_context: {
    candidate_destinations?: string[];
    courses?: CourseCandidate[];
    lodging?: LodgingCandidate[];
  };
  scoring_weights: {
    budget_fit: number;
    travel_fit: number;
    logistics: number;
    vibe_match: number;
    course_quality_proxy: number;
  };
}

export interface PlanTripOptionsResponse {
  schema_version: '1.0';
  options: TripOption[];
  ranked_option_ids: string[];
  notes?: string;
}

// Group Responses
export interface GroupResponse {
  name: string;
  can_make?: string[];
  budget_ok?: boolean | null;
  max_budget?: number | null;
  lodging?: LodgingType | null;
  notes?: string;
}

export interface GroupResponses {
  responses: GroupResponse[];
  consensus: {
    date_range: string;
    budget_pressure: 'low' | 'medium' | 'high';
    lodging_split: Record<string, number>;
  };
}

// Negotiator
export interface NegotiationStrategy {
  id: string; // strat_*
  title: string;
  what_changes: string[];
  pros: string[];
  cons: string[];
  risk_level: RiskLevel;
}

export interface FinalRecommendation {
  chosen_option_id: string;
  message_to_group: string;
  final_itinerary: ItineraryDay[];
  pricing_model: {
    base_per_person: number;
    upgrades_optional: Array<{
      name: string;
      delta_per_person: number;
    }>;
    notes?: string;
  };
}

export interface NegotiatePlanRequest {
  schema_version: '1.0';
  trip_brief: TripBrief;
  shortlist: TripOption[];
  group_responses: GroupResponses;
}

export interface NegotiatePlanResponse {
  schema_version: '1.0';
  strategies: NegotiationStrategy[];
  final_recommendation: FinalRecommendation;
  follow_up_needed: boolean;
  follow_up_question: string | null;
}

// Chat Message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    trip_brief?: Partial<TripBrief>;
    options?: TripOption[];
    [key: string]: any;
  };
}

// App State
export type PlanningState =
  | 'S0_START'
  | 'S1_INTAKE'
  | 'S2_ASSUMPTIONS'
  | 'S3_GENERATION'
  | 'S4_PRESENTATION'
  | 'S5_GROUP_INVITE'
  | 'S6_CONFLICT_RESOLUTION'
  | 'S7_LOCK_PLAN'
  | 'S8_BOOKING';
