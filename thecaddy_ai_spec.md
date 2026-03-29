# TheCaddy.ai — AI Golf Trip & Outing Planner (Techno‑Functional Spec)

> This document captures everything defined so far for **TheCaddy.ai** (domain: **thecaddy.ai**), plus best‑in‑class **prompt + function specs** for core modules: **Extractor**, **Planner**, **Negotiator**.  
> Goal: eliminate implementation drift by using explicit **state machine**, **JSON schemas**, and **validation rules**.

---

## 1) Product Definition (What we’re building)

**TheCaddy.ai** is an **AI assistant golf trip & outing planner** that reduces the friction of planning group golf trips: choosing location/courses/lodging, coordinating preferences, resolving conflicts, and producing an actionable itinerary + shareable plan.

### Core insight
Golf trips fail because of: too many opinions, one organizer becomes a project manager, decision fatigue, and logistics friction. TheCaddy.ai wins by making trip planning **fast**, **low-stress**, and **shareable**.

### MVP promise
> “I planned a legendary golf weekend in 12 minutes.”

---

## 2) Jobs To Be Done

TheCaddy.ai solves four jobs:

1. **Decide faster** (destination/courses)
2. **Coordinate groups without social fallout** (dates/budgets/preferences)
3. **Optimize the experience** (logistics, course clusters, itinerary)
4. **Preserve fun** (no one feels like the trip’s unpaid PM)

---

## 3) AI Flow Overview (State Machine)

### Flow Name
**Plan a Golf Trip** (guided conversational flow producing 2–3 options → shortlist → group invite → conflict resolution → lock plan)

### Roles
- **Trip Captain**: organizer, initiates planning
- **Invitees**: vote + constraints

### States
1. **S0 Start**
2. **S1 Intake & Constraint Capture** → create `TripBrief`
3. **S2 Assumption Setting & Guardrails** → refine `TripBrief`
4. **S3 Option Generation** → produce `TripOptions` (2–3 differentiated packages)
5. **S4 Presentation & Narrowing** → shortlist + refinement
6. **S5 Group Invite & Preference Collection** → `GroupResponses`
7. **S6 Conflict Resolution & Replan** → `FinalRecommendation`
8. **S7 Lock Plan & Export** → itinerary artifact
9. **S8 Booking Hand‑off** → affiliate links / concierge request

### “One Question Rule”
The assistant asks **one question at a time** unless:
- user explicitly wants form-speed capture, or
- UI buttons enable multi-select.

---

## 4) Data Contracts (Canonical Objects)

### 4.1 TripBrief (normalized planning input)
A structured object extracted from freeform input + follow-ups.

```json
{
  "trip_name": "Boys Trip May 2026",
  "origin": {"city":"Philadelphia","state":"PA"},
  "party": {"players":8},
  "dates": {"start":"2026-05-21","end":"2026-05-24","nights":3,"flex_days":2},
  "budget": {"per_person":1200,"scope":"all_in"},
  "preferences": {
    "vibe":"competitive_fun",
    "travel_mode":"drive",
    "lodging":"house_or_resort",
    "golf_density":"36_one_day_ok",
    "tee_time":"mid_morning"
  },
  "constraints": {"avoid":["too_remote"], "must_have":["3 rounds"]},
  "assumptions":[
    "Budget is all-in excluding personal drinks/gambling.",
    "Driving radius up to 4 hours."
  ]
}
```

### 4.2 TripOptions (ranked candidate packages)
2–3 meaningful trip packages.

```json
{
  "options":[
    {
      "id":"opt_a",
      "title":"Poconos Resort Weekender",
      "destination":"Poconos, PA",
      "courses":[{"name":"Course 1"},{"name":"Course 2"},{"name":"Course 3"}],
      "lodging":{"type":"resort","area":"..."},
      "itinerary":[{"day":"Day 1","items":[{"type":"golf","label":"18 holes","time_window":"10:00-15:00"}]}],
      "cost_estimate":{"per_person":1160,"breakdown":{"lodging":450,"golf":420,"food":200,"transport_local":90}},
      "why_it_fits":["Driveable","3 rounds","resort logistics easy"]
    }
  ]
}
```

### 4.3 GroupResponses (invitee inputs + consensus)
```json
{
  "responses":[
    {"name":"Mike","can_make":["2026-05-21..2026-05-24"],"budget_ok":true,"lodging":"house"},
    {"name":"Sam","budget_ok":false,"max_budget":1000}
  ],
  "consensus":{
    "date_range":"2026-05-22..2026-05-24",
    "budget_pressure":"medium",
    "lodging_split":{"house":5,"resort":3}
  }
}
```

---

## 5) MVP Tech Approach (minimal, reliable, shippable)

### Modules (conceptual)
- **TripBrief Extractor**: parse messy text → `TripBrief`
- **Planner**: generate 2–3 trip packages using search + heuristics + scoring
- **Negotiator**: reconcile group conflicts → propose solutions + final plan

(Other modules exist but are not required in this spec: Researcher/Scorer/Narrator/Exporter.)

### Tooling needs (MVP)
- Places search (courses + lodging)
- Distance/time estimation (drive time from origin)
- Caching (avoid option “shifting sands”)
- Optional: pricing heuristics ranges (or curated templates)

---

# 6) Best‑in‑Class Prompt + Function Specs (Implementation‑grade)

## 6.0 Common conventions

### LLM output rules
- Outputs **MUST** be valid JSON conforming to the schemas below.
- No extra keys unless schema allows `additionalProperties: true`.
- Use ISO dates `YYYY-MM-DD`.
- Use stable enums; never invent enum values.
- Provide `confidence` only where schema defines it; never elsewhere.
- If required info is missing, return `missing_fields` and `follow_up_question` (one question only).

### Error handling conventions
Return an `error` object only when:
- input is malformed JSON
- schema validation fails (include error list)
- tool call fails (include tool error list)

### Versioning
Each object includes:
- `schema_version`: `"1.0"`

---

## 6.1 Module 1 — TripBrief Extractor

### Purpose
Transform freeform user input + chat context into a **normalized TripBrief** and determine the **next best single question** if required fields are missing.

### Function signature (internal)
`extract_trip_brief(user_message, chat_context, locale, now_date) -> ExtractTripBriefResponse`

### System prompt (Extractor)
Use this as the **system** message for the Extractor model.

```text
You are TheCaddy.ai’s TripBrief Extractor.
Your job: convert messy human input into a strict TripBrief JSON object.
Rules:
- Output MUST be valid JSON matching the provided schema.
- Do NOT hallucinate specific course names, lodging names, or prices.
- Do NOT assume dates; if user says “late May”, convert to an explicit date range only if chat_context contains year and constraints; otherwise ask a follow-up.
- If a required field is missing, return missing_fields and ask ONE concise follow-up question.
- If user provides conflicts (e.g., budget too low for requested trip), do not reject; set an assumption or constraint flag.
- Always preserve user intent (competitive vs casual, drive vs fly, etc.)
- Use enums exactly as defined in schema. Never invent values.
- Use ISO dates (YYYY-MM-DD).
```

### Input schema
#### `ExtractTripBriefRequest` (JSON Schema)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://thecaddy.ai/schemas/extract_trip_brief_request.json",
  "title": "ExtractTripBriefRequest",
  "type": "object",
  "required": ["schema_version", "user_message", "chat_context", "locale", "now_date"],
  "properties": {
    "schema_version": {"type": "string", "const": "1.0"},
    "user_message": {"type": "string", "minLength": 1, "maxLength": 4000},
    "chat_context": {
      "type": "object",
      "description": "Structured memory from previous turns; may be empty.",
      "properties": {
        "known_trip_brief": {"$ref": "https://thecaddy.ai/schemas/trip_brief.json"},
        "user_profile": {
          "type": "object",
          "properties": {
            "home_city": {"type": "string"},
            "home_state": {"type": "string"}
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "locale": {"type": "string", "default": "en-US"},
    "now_date": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"}
  },
  "additionalProperties": false
}
```

### Output schema
#### `ExtractTripBriefResponse` (JSON Schema)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://thecaddy.ai/schemas/extract_trip_brief_response.json",
  "title": "ExtractTripBriefResponse",
  "type": "object",
  "required": ["schema_version", "trip_brief", "missing_fields", "follow_up_question"],
  "properties": {
    "schema_version": {"type": "string", "const": "1.0"},
    "trip_brief": {"$ref": "https://thecaddy.ai/schemas/trip_brief.json"},
    "missing_fields": {
      "type": "array",
      "items": {"type": "string"},
      "description": "List of missing required fields, using dot-notation paths."
    },
    "follow_up_question": {
      "type": ["string", "null"],
      "description": "One question only. Null if nothing missing."
    },
    "notes": {"type": "string"}
  },
  "additionalProperties": false
}
```

### Canonical TripBrief schema
#### `TripBrief` (JSON Schema)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://thecaddy.ai/schemas/trip_brief.json",
  "title": "TripBrief",
  "type": "object",
  "required": ["schema_version", "origin", "party", "dates", "budget", "preferences", "constraints", "assumptions"],
  "properties": {
    "schema_version": {"type": "string", "const": "1.0"},
    "trip_name": {"type": "string", "default": "Golf Trip"},
    "origin": {
      "type": "object",
      "required": ["city", "state"],
      "properties": {
        "city": {"type": "string", "minLength": 1},
        "state": {"type": "string", "minLength": 2, "maxLength": 2},
        "zip": {"type": "string", "pattern": "^\\d{5}(-\\d{4})?$"}
      },
      "additionalProperties": false
    },
    "party": {
      "type": "object",
      "required": ["players"],
      "properties": {
        "players": {"type": "integer", "minimum": 1, "maximum": 48},
        "skill_mix": {
          "type": "string",
          "enum": ["unknown", "beginner_heavy", "mixed", "experienced_heavy"],
          "default": "unknown"
        }
      },
      "additionalProperties": false
    },
    "dates": {
      "type": "object",
      "required": ["start", "end", "nights", "flex_days"],
      "properties": {
        "start": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
        "end": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
        "nights": {"type": "integer", "minimum": 0, "maximum": 30},
        "flex_days": {"type": "integer", "minimum": 0, "maximum": 14}
      },
      "additionalProperties": false
    },
    "budget": {
      "type": "object",
      "required": ["per_person", "scope"],
      "properties": {
        "per_person": {"type": "integer", "minimum": 100, "maximum": 20000},
        "scope": {"type": "string", "enum": ["all_in", "golf_only", "unknown"], "default": "unknown"},
        "currency": {"type": "string", "default": "USD"}
      },
      "additionalProperties": false
    },
    "preferences": {
      "type": "object",
      "required": ["vibe", "travel_mode", "lodging", "golf_density", "tee_time"],
      "properties": {
        "vibe": {"type": "string", "enum": ["competitive", "casual", "competitive_fun", "mixed"]},
        "travel_mode": {"type": "string", "enum": ["drive", "fly", "either"]},
        "lodging": {"type": "string", "enum": ["house", "hotel", "resort", "house_or_resort", "any"]},
        "golf_density": {"type": "string", "enum": ["18_per_day", "36_one_day_ok", "36_daily", "flex"]},
        "tee_time": {"type": "string", "enum": ["early", "mid_morning", "noon", "flex"]}
      },
      "additionalProperties": false
    },
    "constraints": {
      "type": "object",
      "required": ["avoid", "must_have"],
      "properties": {
        "avoid": {"type": "array", "items": {"type": "string"}, "default": []},
        "must_have": {"type": "array", "items": {"type": "string"}, "default": []},
        "max_drive_hours": {"type": "integer", "minimum": 1, "maximum": 24, "default": 4}
      },
      "additionalProperties": false
    },
    "assumptions": {
      "type": "array",
      "items": {"type": "string"},
      "default": []
    }
  },
  "additionalProperties": false,

  "allOf": [
    {
      "description": "Validation rule: end must be >= start (enforced at runtime)."
    }
  ]
}
```

### Validation rules (Extractor)
Runtime validations the service MUST enforce (beyond JSON Schema):
1. `dates.end >= dates.start` (date compare)
2. `dates.nights == (end - start)` if both are explicit and user didn’t specify an override; else compute `nights`
3. If `budget.scope == unknown`, add missing field `budget.scope` and ask: “Is that $X per person all‑in or golf‑only?”
4. If `origin.state` isn’t 2 letters, normalize (e.g., “Pennsylvania” → “PA”) else ask.
5. If user provides relative time (“late May”), ask one follow-up unless year is known in context.

### Follow-up question policy
- Ask for the *highest leverage missing field* first, in order:
  1) dates
  2) budget scope
  3) origin
  4) group size
  5) vibe/travel mode

---

## 6.2 Module 2 — Planner

### Purpose
Given a valid `TripBrief`, generate **2–3 differentiated trip options** with a structured itinerary and cost estimate ranges.

### Function signature (internal)
`plan_trip_options(trip_brief, inventory_context, scoring_weights) -> PlanTripOptionsResponse`

### System prompt (Planner)
```text
You are TheCaddy.ai’s Trip Planner.
Your job: produce 2–3 trip options that satisfy the TripBrief constraints.
Rules:
- Output MUST be valid JSON matching the schema.
- Do NOT hallucinate precise prices. Use estimate ranges and explain assumptions in notes.
- Prefer options that are meaningfully different: (best fit / best value / best vibes).
- Courses and lodging suggestions must come from inventory_context if provided; if not provided, use placeholders with "TBD" and mark need_research=true.
- Keep logistics sane: cluster courses within a reasonable radius; avoid excessive driving between rounds.
- Include a score_breakdown to make ranking explainable.
```

### Input schema
#### `PlanTripOptionsRequest` (JSON Schema)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://thecaddy.ai/schemas/plan_trip_options_request.json",
  "title": "PlanTripOptionsRequest",
  "type": "object",
  "required": ["schema_version", "trip_brief", "inventory_context", "scoring_weights"],
  "properties": {
    "schema_version": {"type": "string", "const": "1.0"},
    "trip_brief": {"$ref": "https://thecaddy.ai/schemas/trip_brief.json"},
    "inventory_context": {
      "type": "object",
      "description": "Search results, cached lists, pricing heuristics. Can be empty in MVP.",
      "properties": {
        "candidate_destinations": {"type": "array", "items": {"type": "string"}},
        "courses": {
          "type": "array",
          "items": {"$ref": "https://thecaddy.ai/schemas/course_candidate.json"},
          "default": []
        },
        "lodging": {
          "type": "array",
          "items": {"$ref": "https://thecaddy.ai/schemas/lodging_candidate.json"},
          "default": []
        }
      },
      "additionalProperties": true
    },
    "scoring_weights": {
      "type": "object",
      "required": ["budget_fit", "travel_fit", "logistics", "vibe_match", "course_quality_proxy"],
      "properties": {
        "budget_fit": {"type": "number", "minimum": 0, "maximum": 1},
        "travel_fit": {"type": "number", "minimum": 0, "maximum": 1},
        "logistics": {"type": "number", "minimum": 0, "maximum": 1},
        "vibe_match": {"type": "number", "minimum": 0, "maximum": 1},
        "course_quality_proxy": {"type": "number", "minimum": 0, "maximum": 1}
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Supporting schemas
#### `CourseCandidate`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/course_candidate.json",
  "title":"CourseCandidate",
  "type":"object",
  "required":["name","city","state","lat","lng","quality_proxy"],
  "properties":{
    "name":{"type":"string","minLength":1},
    "city":{"type":"string"},
    "state":{"type":"string","minLength":2,"maxLength":2},
    "lat":{"type":"number","minimum":-90,"maximum":90},
    "lng":{"type":"number","minimum":-180,"maximum":180},
    "quality_proxy":{"type":"number","minimum":0,"maximum":100},
    "notes":{"type":"string"},
    "source":{"type":"string","default":"unknown"}
  },
  "additionalProperties": true
}
```

#### `LodgingCandidate`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/lodging_candidate.json",
  "title":"LodgingCandidate",
  "type":"object",
  "required":["name","type","city","state","lat","lng"],
  "properties":{
    "name":{"type":"string","minLength":1},
    "type":{"type":"string","enum":["house","hotel","resort","tbd"]},
    "city":{"type":"string"},
    "state":{"type":"string","minLength":2,"maxLength":2},
    "lat":{"type":"number","minimum":-90,"maximum":90},
    "lng":{"type":"number","minimum":-180,"maximum":180},
    "price_proxy_per_night":{"type":["number","null"],"minimum":0},
    "source":{"type":"string","default":"unknown"}
  },
  "additionalProperties": true
}
```

### Output schema
#### `PlanTripOptionsResponse`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/plan_trip_options_response.json",
  "title":"PlanTripOptionsResponse",
  "type":"object",
  "required":["schema_version","options","ranked_option_ids","notes"],
  "properties":{
    "schema_version":{"type":"string","const":"1.0"},
    "options":{
      "type":"array",
      "minItems":2,
      "maxItems":3,
      "items":{"$ref":"https://thecaddy.ai/schemas/trip_option.json"}
    },
    "ranked_option_ids":{
      "type":"array",
      "items":{"type":"string"},
      "minItems":2,
      "maxItems":3
    },
    "notes":{"type":"string"}
  },
  "additionalProperties": false
}
```

#### `TripOption`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/trip_option.json",
  "title":"TripOption",
  "type":"object",
  "required":["id","title","tagline","destination","need_research","courses","lodging","itinerary","cost_estimate","score_breakdown","why_it_fits"],
  "properties":{
    "id":{"type":"string","pattern":"^opt_[a-z0-9_]+$"},
    "title":{"type":"string","minLength":3},
    "tagline":{"type":"string","minLength":3},
    "destination":{"type":"string","minLength":2},
    "need_research":{"type":"boolean","default":false},
    "courses":{
      "type":"array",
      "minItems":2,
      "maxItems":6,
      "items":{"$ref":"https://thecaddy.ai/schemas/course_pick.json"}
    },
    "lodging":{"$ref":"https://thecaddy.ai/schemas/lodging_pick.json"},
    "itinerary":{
      "type":"array",
      "minItems":1,
      "items":{"$ref":"https://thecaddy.ai/schemas/itinerary_day.json"}
    },
    "cost_estimate":{"$ref":"https://thecaddy.ai/schemas/cost_estimate.json"},
    "score_breakdown":{
      "type":"object",
      "required":["total","budget_fit","travel_fit","logistics","vibe_match","course_quality_proxy"],
      "properties":{
        "total":{"type":"number","minimum":0,"maximum":100},
        "budget_fit":{"type":"number","minimum":0,"maximum":100},
        "travel_fit":{"type":"number","minimum":0,"maximum":100},
        "logistics":{"type":"number","minimum":0,"maximum":100},
        "vibe_match":{"type":"number","minimum":0,"maximum":100},
        "course_quality_proxy":{"type":"number","minimum":0,"maximum":100}
      },
      "additionalProperties": false
    },
    "why_it_fits":{"type":"array","items":{"type":"string"}, "minItems":2, "maxItems":6}
  },
  "additionalProperties": false
}
```

#### `CoursePick`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/course_pick.json",
  "title":"CoursePick",
  "type":"object",
  "required":["name","role","holes"],
  "properties":{
    "name":{"type":"string"},
    "role":{"type":"string","enum":["anchor","value","vibes","backup","tbd"]},
    "holes":{"type":"integer","enum":[9,18,27,36]},
    "notes":{"type":"string"}
  },
  "additionalProperties": false
}
```

#### `LodgingPick`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/lodging_pick.json",
  "title":"LodgingPick",
  "type":"object",
  "required":["type","name_or_area","nights"],
  "properties":{
    "type":{"type":"string","enum":["house","hotel","resort","tbd"]},
    "name_or_area":{"type":"string"},
    "nights":{"type":"integer","minimum":0,"maximum":30},
    "notes":{"type":"string"}
  },
  "additionalProperties": false
}
```

#### `ItineraryDay`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/itinerary_day.json",
  "title":"ItineraryDay",
  "type":"object",
  "required":["day_label","items"],
  "properties":{
    "day_label":{"type":"string","minLength":3},
    "items":{
      "type":"array",
      "minItems":1,
      "items":{"$ref":"https://thecaddy.ai/schemas/itinerary_item.json"}
    }
  },
  "additionalProperties": false
}
```

#### `ItineraryItem`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/itinerary_item.json",
  "title":"ItineraryItem",
  "type":"object",
  "required":["type","label","time_window"],
  "properties":{
    "type":{"type":"string","enum":["travel","golf","meal","nightlife","rest","other"]},
    "label":{"type":"string","minLength":2},
    "time_window":{"type":"string","pattern":"^\\d{2}:\\d{2}-\\d{2}:\\d{2}$"},
    "notes":{"type":"string"}
  },
  "additionalProperties": false
}
```

#### `CostEstimate`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/cost_estimate.json",
  "title":"CostEstimate",
  "type":"object",
  "required":["per_person_target","per_person_estimated","confidence","breakdown"],
  "properties":{
    "per_person_target":{"type":"integer","minimum":0},
    "per_person_estimated":{"type":"integer","minimum":0},
    "confidence":{"type":"string","enum":["low","medium","high"]},
    "breakdown":{
      "type":"object",
      "required":["lodging","golf","food","local_transport","misc"],
      "properties":{
        "lodging":{"type":"integer","minimum":0},
        "golf":{"type":"integer","minimum":0},
        "food":{"type":"integer","minimum":0},
        "local_transport":{"type":"integer","minimum":0},
        "misc":{"type":"integer","minimum":0}
      },
      "additionalProperties": false
    },
    "assumptions":{"type":"array","items":{"type":"string"}, "default":[]}
  },
  "additionalProperties": false
}
```

### Validation rules (Planner)
Runtime validations:
1. `options.length` must be 2–3
2. `ranked_option_ids` must contain exactly the option IDs, no extras
3. Each option must include at least **2 golf items** in itinerary if `must_have` includes “2 rounds”; at least **3** if includes “3 rounds”
4. If `budget.scope == golf_only`, cost_estimate must exclude lodging/food/transport (set them to 0 and note assumptions)
5. `cost_estimate.per_person_estimated` must equal sum(breakdown) (enforce)
6. `score_breakdown.total` must be a weighted combination and **monotonic** (higher partials should not reduce total without explanation)

---

## 6.3 Module 3 — Negotiator

### Purpose
Given `TripBrief`, shortlisted option(s), and `GroupResponses`, propose **conflict-resolved recommendations** and produce a final plan candidate.

### Function signature (internal)
`negotiate_plan(trip_brief, shortlist, group_responses) -> NegotiatePlanResponse`

### System prompt (Negotiator)
```text
You are TheCaddy.ai’s Group Negotiator.
Your job: reconcile conflicts across dates, budget, and preferences without drama.
Rules:
- Output MUST be valid JSON matching the schema.
- Propose at most 3 resolution strategies, ranked.
- Use “base plan + upgrades” when budget disagreement exists.
- Use “shorter trip / alternate weekend” when date availability is the blocker.
- Preserve the spirit of the trip (vibe) unless the group forces a change.
- Provide a final_recommendation that is actionable and explains tradeoffs.
```

### Input schema
#### `NegotiatePlanRequest`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/negotiate_plan_request.json",
  "title":"NegotiatePlanRequest",
  "type":"object",
  "required":["schema_version","trip_brief","shortlist","group_responses"],
  "properties":{
    "schema_version":{"type":"string","const":"1.0"},
    "trip_brief":{"$ref":"https://thecaddy.ai/schemas/trip_brief.json"},
    "shortlist":{
      "type":"array",
      "minItems":1,
      "maxItems":3,
      "items":{"$ref":"https://thecaddy.ai/schemas/trip_option.json"}
    },
    "group_responses":{"$ref":"https://thecaddy.ai/schemas/group_responses.json"}
  },
  "additionalProperties": false
}
```

#### `GroupResponses` schema
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/group_responses.json",
  "title":"GroupResponses",
  "type":"object",
  "required":["responses","consensus"],
  "properties":{
    "responses":{
      "type":"array",
      "minItems":1,
      "maxItems":64,
      "items":{
        "type":"object",
        "required":["name"],
        "properties":{
          "name":{"type":"string","minLength":1},
          "can_make":{"type":"array","items":{"type":"string"}, "default":[]},
          "budget_ok":{"type":["boolean","null"]},
          "max_budget":{"type":["integer","null"],"minimum":0},
          "lodging":{"type":["string","null"],"enum":["house","hotel","resort","any",null]},
          "notes":{"type":"string"}
        },
        "additionalProperties": false
      }
    },
    "consensus":{
      "type":"object",
      "required":["date_range","budget_pressure","lodging_split"],
      "properties":{
        "date_range":{"type":"string","minLength":1},
        "budget_pressure":{"type":"string","enum":["low","medium","high"]},
        "lodging_split":{
          "type":"object",
          "additionalProperties":{"type":"integer","minimum":0}
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Output schema
#### `NegotiatePlanResponse`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/negotiate_plan_response.json",
  "title":"NegotiatePlanResponse",
  "type":"object",
  "required":["schema_version","strategies","final_recommendation","follow_up_needed"],
  "properties":{
    "schema_version":{"type":"string","const":"1.0"},
    "strategies":{
      "type":"array",
      "minItems":1,
      "maxItems":3,
      "items":{"$ref":"https://thecaddy.ai/schemas/negotiation_strategy.json"}
    },
    "final_recommendation":{"$ref":"https://thecaddy.ai/schemas/final_recommendation.json"},
    "follow_up_needed":{"type":"boolean"},
    "follow_up_question":{"type":["string","null"]}
  },
  "additionalProperties": false
}
```

#### `NegotiationStrategy`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/negotiation_strategy.json",
  "title":"NegotiationStrategy",
  "type":"object",
  "required":["id","title","what_changes","pros","cons","risk_level"],
  "properties":{
    "id":{"type":"string","pattern":"^strat_[a-z0-9_]+$"},
    "title":{"type":"string"},
    "what_changes":{"type":"array","items":{"type":"string"}, "minItems":1, "maxItems":6},
    "pros":{"type":"array","items":{"type":"string"}, "minItems":1, "maxItems":6},
    "cons":{"type":"array","items":{"type":"string"}, "minItems":1, "maxItems":6},
    "risk_level":{"type":"string","enum":["low","medium","high"]}
  },
  "additionalProperties": false
}
```

#### `FinalRecommendation`
```json
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "$id":"https://thecaddy.ai/schemas/final_recommendation.json",
  "title":"FinalRecommendation",
  "type":"object",
  "required":["chosen_option_id","message_to_group","final_itinerary","pricing_model"],
  "properties":{
    "chosen_option_id":{"type":"string"},
    "message_to_group":{"type":"string","minLength":10},
    "final_itinerary":{
      "type":"array",
      "items":{"$ref":"https://thecaddy.ai/schemas/itinerary_day.json"},
      "minItems":1
    },
    "pricing_model":{
      "type":"object",
      "required":["base_per_person","upgrades_optional","notes"],
      "properties":{
        "base_per_person":{"type":"integer","minimum":0},
        "upgrades_optional":{
          "type":"array",
          "items":{
            "type":"object",
            "required":["name","delta_per_person"],
            "properties":{
              "name":{"type":"string"},
              "delta_per_person":{"type":"integer"}
            },
            "additionalProperties": false
          },
          "default":[]
        },
        "notes":{"type":"string"}
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Validation rules (Negotiator)
Runtime validations:
1. `strategies.length` 1–3
2. `final_recommendation.chosen_option_id` must be in shortlist IDs
3. If budget pressure is `high`, `pricing_model.upgrades_optional` must exist (base + upgrade pattern) **or** follow_up_needed=true with a clear question
4. follow_up_question must be **one question only** (no compound questions)

---

# 7) Suggested API Endpoints (MVP)

These are implementable without overengineering:

- `POST /v1/extract` → `ExtractTripBriefResponse`
- `POST /v1/plan` → `PlanTripOptionsResponse`
- `POST /v1/negotiate` → `NegotiatePlanResponse`

---

# 8) Pricing Strategy (defined earlier)

Event-based pricing:
- Free: one basic trip plan (hook)
- $29–$49 per trip: full planning + group coordination
- $99+: concierge booking add-on

---

# 9) Brand positioning notes

TheCaddy.ai voice: competent, calm, slightly sarcastic, always on your side.

---

## Appendix A — Implementation Notes (to avoid drift)

- Use schema validation at service boundaries (reject invalid objects).
- Persist canonical objects: `TripBrief`, `TripOptions`, `GroupResponses`.
- Cache inventory results by `(origin, date-range, budget, players, vibe)` for stable option rendering.
- Treat pricing as **estimate** until integrations exist; never imply confirmed tee time availability in MVP.

