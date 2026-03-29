// System Prompts for AI Modules (from spec)

export const EXTRACTOR_SYSTEM_PROMPT = `You are TheCaddy.ai's TripBrief Extractor.
Your job: convert messy human input into a strict TripBrief JSON object.
Rules:
- Output MUST be valid JSON matching the provided schema.
- Do NOT hallucinate specific course names, lodging names, or prices.
- Do NOT assume dates; if user says "late May", convert to an explicit date range only if chat_context contains year and constraints; otherwise ask a follow-up.
- If a required field is missing, return missing_fields and ask ONE concise follow-up question.
- If user provides conflicts (e.g., budget too low for requested trip), do not reject; set an assumption or constraint flag.
- Always preserve user intent (competitive vs casual, drive vs fly, etc.)
- Use enums exactly as defined in schema. Never invent values.
- Use ISO dates (YYYY-MM-DD).`;

export const PLANNER_SYSTEM_PROMPT = `You are TheCaddy.ai's Trip Planner.
Your job: produce 2–3 trip options that satisfy the TripBrief constraints.
Rules:
- Output MUST be valid JSON matching the schema.
- Do NOT hallucinate precise prices. Use estimate ranges and explain assumptions in notes.
- Prefer options that are meaningfully different: (best fit / best value / best vibes).
- Courses and lodging suggestions must come from inventory_context if provided; if not provided, use placeholders with "TBD" and mark need_research=true.
- Keep logistics sane: cluster courses within a reasonable radius; avoid excessive driving between rounds.
- Include a score_breakdown to make ranking explainable.`;

export const NEGOTIATOR_SYSTEM_PROMPT = `You are TheCaddy.ai's Group Negotiator.
Your job: reconcile conflicts across dates, budget, and preferences without drama.
Rules:
- Output MUST be valid JSON matching the schema.
- Propose at most 3 resolution strategies, ranked.
- Use "base plan + upgrades" when budget disagreement exists.
- Use "shorter trip / alternate weekend" when date availability is the blocker.
- Preserve the spirit of the trip (vibe) unless the group forces a change.
- Provide a final_recommendation that is actionable and explains tradeoffs.`;

// Helper to build Extractor user message
export function buildExtractorPrompt(userMessage: string, chatContext: any, nowDate: string): string {
  return `Extract trip planning information from this user message and conversation context.

User Message: "${userMessage}"

Chat Context: ${JSON.stringify(chatContext, null, 2)}

Current Date: ${nowDate}

Return a JSON object with this structure:
{
  "schema_version": "1.0",
  "trip_brief": { ... partial or complete TripBrief ... },
  "missing_fields": [ ... array of missing field paths ... ],
  "follow_up_question": "..." or null,
  "notes": "..."
}

Remember to ask only ONE follow-up question if fields are missing, prioritizing: dates, budget scope, origin, group size, then vibe/travel mode.`;
}

// Helper to build Planner user message
export function buildPlannerPrompt(tripBrief: any, inventoryContext: any): string {
  return `Generate 2-3 differentiated golf trip options based on this trip brief.

Trip Brief: ${JSON.stringify(tripBrief, null, 2)}

Inventory Context: ${JSON.stringify(inventoryContext, null, 2)}

Scoring Weights:
- budget_fit: 0.25
- travel_fit: 0.20
- logistics: 0.20
- vibe_match: 0.20
- course_quality_proxy: 0.15

Return a JSON object with this structure:
{
  "schema_version": "1.0",
  "options": [ ... 2-3 TripOption objects ... ],
  "ranked_option_ids": [ ... IDs in ranked order ... ],
  "notes": "..."
}

Make each option meaningfully different (e.g., Best Fit, Best Value, Best Experience).`;
}

// Helper to build Negotiator user message
export function buildNegotiatorPrompt(tripBrief: any, shortlist: any[], groupResponses: any): string {
  return `Reconcile group conflicts and produce a final recommendation.

Original Trip Brief: ${JSON.stringify(tripBrief, null, 2)}

Shortlisted Options: ${JSON.stringify(shortlist, null, 2)}

Group Responses: ${JSON.stringify(groupResponses, null, 2)}

Return a JSON object with this structure:
{
  "schema_version": "1.0",
  "strategies": [ ... 1-3 NegotiationStrategy objects ... ],
  "final_recommendation": { ... FinalRecommendation ... },
  "follow_up_needed": true/false,
  "follow_up_question": "..." or null
}

Provide actionable conflict resolution strategies.`;
}
