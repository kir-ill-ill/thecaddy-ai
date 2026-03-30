# TheCaddy.ai — Dream Product Vision
# Version 1.0 | March 2026

---

## Executive Summary

TheCaddy.ai is the AI-native golf trip planning platform that makes every golfer feel like
they have a scratch-handicap friend who also happens to know every head pro, resort GM,
and tee sheet in America. The product wins not by adding features but by removing friction:
one conversation replaces twelve text threads, three spreadsheets, and six weeks of "we
should really nail this down soon."

The MVP promise — "I planned a legendary golf weekend in 12 minutes" — is already the
right north star. This document designs the product that makes that promise not just true
but inevitable.

---

## 1. Core Experience Redesign

### What the planning flow should FEEL like

The current flow is correct in structure (state machine S0-S8) but clinical in execution.
The dream experience has three emotional registers:

**Register 1: The Setup (S0-S2) — feels like texting a well-connected friend**
The AI opens with personality, not a form. It already knows something useful — your home
city, your last trip, your handicap. When you type "Scottsdale for 8 guys in May", it
doesn't ask "what is your budget scope?" — it says "Classic. I'm thinking $1,100-1,400
per person all-in depending on which courses we land. Does that range work, or are we
going full send / keeping it lean?"

The one-question rule from the spec is correct. But the questions need to sound like a
friend who already has context, not a web form that lost its CSS.

**Register 2: The Options (S3-S4) — feels like Airbnb discovered golf**
Options are not a text list. They are full visual cards with:
- A hero image of the anchor course (sourced from course database or Unsplash fallback)
- An interactive day-by-day itinerary timeline
- A live cost breakdown slider (drag budget up/down and watch the courses adapt)
- A "Why This Works For Your Group" section written in plain English, not bullet enums
- A weather forecast widget for the target week
- Drive time from origin shown as "4h 20min from Philly" not a lat/lng score

The three options must be truly different archetypes, labeled as the product positions them:
- "The Classic" — best course quality, predictable logistics
- "The Deal" — best value per experience dollar
- "The Memory" — most distinctive / bucket-list element, slightly outside the comfort zone

**Register 3: The Group Layer (S5-S7) — feels like a game, not a meeting**
Group voting is currently a functional swipe UI. The dream version adds:
- A live "heat meter" showing which option is gaining momentum as votes come in
- Named voter avatars so the Captain sees "Dave voted The Classic, Mike voted The Memory"
- An AI-generated consensus summary: "6/8 people have voted. The Classic is leading but
  The Deal has 3 strong supporters due to budget. I recommend shortlisting both."
- A single "Lock It In" action that sends a beautiful confirmation to the whole group

### The "Commissioner" metaphor (already present in demo)

The demo-mobile page nails the right metaphor: the trip organizer is the Commissioner,
the AI is the Caddy. This vocabulary should permeate the product:
- "Commissioner's Desk" for the dashboard
- "The Caddy's Recommendation" for AI suggestions
- "The Roster" for group members
- "The Pot" for collected funds
- "Lock the Card" for confirming the trip

This is differentiated positioning. Every other travel tool calls the organizer an "admin."
TheCaddy.ai calls them the Commissioner. That single word makes planning feel prestigious
rather than administrative.

---

## 2. Feature Tiers

### Free Tier — The Hook

**Goal:** Get the first "whoa" moment. Give away enough value that every Commissioner
shares the link unprompted.

Features:
- 1 AI-generated trip plan per month (full Extractor + Planner modules)
- 3 differentiated trip options with full itinerary and cost estimates
- Shareable vote link (public, no login required for voters)
- Basic course info (name, location, type, price tier)
- Group response collection (dates, budget OK/not, lodging preference)
- "Powered by TheCaddy.ai" attribution on all shared pages (viral vector)
- Trip saved to account for 30 days

**Hard limits (preserve upgrade motivation):**
- No weather forecasting
- No real tee time availability
- No payment collection
- No AI negotiation/conflict resolution
- No export to PDF/calendar
- No multi-round (3-4 day) trip planning

### Pro Tier — $9.99/month or $29/trip

**Goal:** Capture the annual trip Captain. This is someone who plans 1-3 trips per year
and is tired of being the unpaid project manager.

Everything in Free, plus:
- Unlimited trip plans
- Full AI Negotiator (conflict resolution, base + upgrades pricing model)
- Group voting with real-time results dashboard
- Cost splitting + payment collection via Stripe (the fund system already built)
- Weather forecast for trip dates (OpenWeatherMap or Weather.gov API)
- Tee time availability window (GolfNow/TeeOff API check — "times available" not booking)
- Lodging search integration (Hotels.com or Booking.com affiliate links)
- Restaurant recommendations near courses (Google Places API)
- PDF/calendar export of final itinerary
- Trip saved for 1 year
- Email/SMS nudges to group members who haven't voted or paid

**Pricing rationale:** $29/trip captures the occasional user. $9.99/month captures the
Commissioner who runs 2+ trips per year and plans year-round. Annual at $79 should also
be offered.

### Captain Tier — $19.99/month or $49/trip

**Goal:** Capture the serious golf traveler who does 4+ trips per year, runs a regular
group, and wants to look like a professional organizer.

Everything in Pro, plus:
- Concierge booking (TheCaddy.ai team books tee times and lodging on your behalf)
- Multi-round trip planning (3-4 day itineraries with 4-5 courses)
- Budget optimizer ("Find me the best 4 courses for under $1,400/person all-in")
- Custom branded trip pages (group name, photo, theme color — no TheCaddy.ai branding)
- Post-trip scorecard entry and photo sharing (trip memory page)
- Handicap-aware pairing suggestions for tee time groupings
- 5-day weather forecast with course condition predictions
- Priority support via chat
- Trip archive (all trips, unlimited history)

**The post-trip memory page** is an underrated retention and viral feature. After the trip,
the Captain inputs scores, uploads photos, and the AI generates a "Trip Report" — a
shareable page with highlights, low scores, side bets won, and a "Next Trip" CTA.
This is shared in the group chat every time and brings back the whole crew next year.

### Enterprise/Corporate — $99/month

**Goal:** Capture corporate entertainment, golf outing companies, and club event planners.

Everything in Captain, plus:
- White-label trip pages (custom domain, client's logo, no TheCaddy.ai branding)
- Client entertainment trip planning (client-facing trip pages that look like the company
  is running a premium concierge service)
- Bulk tee time booking (block bookings, shotgun starts)
- Branded invitations (email + print-quality PDF)
- Expense report integration (Concur, SAP) — line-item export of all trip costs
- Analytics dashboard (trips planned, total group spend, conversion rates, ROI by client)
- Multiple Commissioner seats per account (team planning)
- Dedicated account manager for 5+ trips/month accounts
- API access for CRM integration

**The corporate wedge:** Golf outings are a $3B+ B2B entertainment segment. A corporate
event planner booking 10 client entertainment rounds per year is worth $1,188+/year.
One enterprise account outweighs 100 free users.

---

## 3. Technical Architecture

### Frontend

**Framework:** Next.js 15+ with App Router (already in use).

Key architectural decisions:

**Route structure:**
```
app/
  (marketing)/           # Static marketing pages
    page.tsx             # Landing page
    pricing/page.tsx
    about/page.tsx
  (app)/                 # Authenticated app shell
    layout.tsx           # Persistent nav + session
    dashboard/page.tsx
    trip/
      new/page.tsx       # AI planning flow
      [id]/
        page.tsx         # Trip detail
        vote/page.tsx    # Captain's vote management
        fund/page.tsx    # Fund setup
        book/page.tsx    # Booking integration
        recap/page.tsx   # Post-trip memory page
  (public)/              # No auth required
    vote/[id]/page.tsx   # Group voting (already built)
    pay/[code]/page.tsx  # Payment (already built)
    t/[shareCode]/       # Public trip page (branded)
```

**State management:** Zustand (already in use via `lib/store.ts`). Keep it. Persist the
active TripBrief to localStorage so users can resume mid-session. Add a server-side
`trips` table as the canonical source of truth.

**Real-time:** Use Ably or Pusher for WebSocket-based live vote updates. The vote page
currently polls or reloads. The dream is: Dave votes on his phone and Mike's screen
updates in 800ms without a refresh. This is a 2-hour integration once an account is set up.
Ably's free tier (200 concurrent connections) covers all of Phase 1-2 easily.

**Component design principles:**
- Trip option cards must support both compact (list) and expanded (full-screen) modes
- All share/vote pages must render beautifully on mobile with zero horizontal scroll
- The itinerary timeline component (already prototyped in demo-mobile) should be extracted
  into a reusable `<TripTimeline>` component shared across planning, detail, and recap views
- Dark mode: not required in Phase 1, but design tokens should use CSS variables from day 1
  so it can be shipped in Phase 3 without a CSS rewrite

### AI Architecture

**Models:**
- Primary planning: Claude 3.5 Sonnet (superior structured output, better at geography
  and golf knowledge than GPT-4o in testing)
- Fast extraction: Claude 3 Haiku (Extractor module — speed matters here, user is typing)
- Fallback: GPT-4o-mini for any OpenAI-specific tool calls (maintain dual-provider setup
  for reliability)

**Tool calling vs RAG:**

Use tool calling for anything that requires real-world lookup:
```
search_courses(lat, lng, radius_miles, quality_min) -> CourseCandidate[]
check_tee_availability(course_id, date_range) -> AvailabilityWindow[]
get_drive_time(origin, destination) -> { hours: number, miles: number }
get_weather_forecast(lat, lng, date_range) -> DailyForecast[]
search_lodging(destination, checkin, checkout, guests) -> LodgingCandidate[]
```

Use RAG (vector search against a course database) for:
- "What courses are near Scottsdale that are worth the money?"
- Course reputation scoring, difficulty, amenities, pace of play
- Seasonal considerations ("Myrtle Beach in July is brutal")

**Course database sourcing:**
The inventory problem is the hardest and most important. Three-tier approach:
1. Seed with USGA course database (publicly available) — ~30,000 US courses with coordinates
2. Enrich top 2,000 courses with quality scores, green fees, and booking links via GolfNow
   partner API
3. For MVP: start with curated seed data for 15 top golf travel destinations (Scottsdale,
   Myrtle Beach, Hilton Head, Pinehurst, Palm Springs, Pebble Beach area, Bandon Dunes,
   TPC Sawgrass area, Kiawah, Sea Island, Virginia Beach area, Pocono/Catskills,
   Finger Lakes, Wisconsin Dells, Lake Geneva). These 15 destinations cover 80% of
   US group golf travel volume.

**Prompt architecture:**
The current prompts in `lib/prompts.ts` are correct scaffolding. Enhance them with:
- Few-shot examples (3-4 real trip briefs with ideal outputs) embedded in system prompts
- Geographic context injection: before calling the Planner, enrich inventory_context with
  actual course candidates from the database via tool call
- Assumption surfacing: the AI should proactively state "I'm assuming you want to drive
  since Scottsdale is 5 hours from your listed home city of Denver — correct?" rather than
  waiting to be told

**Caching strategy:**
The spec correctly calls out "shifting sands" as a failure mode. Cache at two levels:
1. Course inventory: cache GolfNow/database results by (destination, date_range) for 24h
2. Trip options: once generated for a given TripBrief hash, serve from cache. The AI
   should not regenerate options on every page refresh. Store in PostgreSQL alongside
   the trip record.

### Database

**PostgreSQL on Neon** (already in use). Schema additions needed:

```sql
-- Courses (seed database)
courses (
  id, name, city, state, lat, lng,
  quality_score, green_fee_low, green_fee_high,
  booking_url, holes, par, yardage,
  slope_rating, course_rating,
  amenities jsonb, tags text[],
  golfnow_id, source, updated_at
)

-- Destinations (curated top-15 list)
destinations (
  id, name, region, state,
  center_lat, center_lng, radius_miles,
  drive_time_cities jsonb,  -- { "Philadelphia": 4.2, "Atlanta": 2.1 }
  season_quality jsonb,     -- { "jan": 3, "may": 9, "jul": 6 }
  description, hero_image_url
)

-- Add to trips table
trips (
  ...existing columns...,
  tier varchar,             -- 'free' | 'pro' | 'captain' | 'enterprise'
  brand_config jsonb,       -- for white-label (logo, colors, domain)
  weather_data jsonb,       -- cached forecast for trip dates
  final_option_id uuid,     -- locked choice
  booking_status varchar,
  recap_data jsonb          -- post-trip scores, photos, highlights
)
```

### Payments

**Stripe** (already integrated). Build on what exists:

Phase 1: Fund collection (already built — per-person dues, shared fund, Stripe Checkout)
Phase 2: Platform subscription billing (Stripe Billing for monthly/annual Pro and Captain)
Phase 3: Booking payment flow — when TheCaddy.ai books tee times on behalf of the group,
collect full payment upfront and pay the course on booking. This requires a Stripe Connect
setup where TheCaddy.ai is the merchant and holds funds briefly.

**Cost splitting math:**
The current fund system collects equal amounts. Add a smart split calculator:
- Equal split (default)
- Custom split (the Captain entered wrong amount for Sam — override)
- Partial pay (Sam only coming day 2 — auto-calculate 2/3 share)
- Handicap-side-bet tracking (separate from trip costs, just for fun)

### Real-time

**Ably** for WebSocket-based live vote updates. Integration points:
- Channel per trip: `trip:{tripId}:votes`
- Events: `vote.cast`, `vote.changed`, `consensus.reached`
- The vote page subscribes on mount, publishes after each submit
- The Captain's dashboard shows a live tally updating without refresh

Alternative: use Next.js Route Handlers with Server-Sent Events (SSE) if Ably adds
unwanted dependency complexity. SSE is simpler for one-way server-to-client updates
(vote results).

### Notifications

**Transactional email:** Resend (simpler API than SendGrid, generous free tier, excellent
React Email template support)

**SMS:** Twilio (already mentioned in spec). Key notification touchpoints:
- "You've been invited to vote on [Trip Name]" — vote link
- "Payment due: $500 for [Trip Name] by [Date]" — payment link
- "The group picked [Option Name]! Trip is locked." — confirmation
- "2 players haven't voted yet" — nudge to Captain
- "Your tee time at [Course] is in 48 hours" — day-before reminder

**Push notifications (PWA):** Web Push API via service worker. Needed for:
- Real-time vote updates when a group member votes
- Payment received confirmations for the Captain
- "Trip is in 7 days — here's your weather forecast" digest

### Maps

**Google Maps Platform** for:
- Course location display on option cards (Static Maps API — one image, no JavaScript)
- Drive time from origin (Distance Matrix API)
- "Courses near destination" radius search (Places API)
- Directions to accommodation and courses in the itinerary

Use Static Maps API for card thumbnails (cheap, no JS required, works in SSR). Use
the full JavaScript Maps SDK only on the trip detail page where users interact with
the map.

### Weather

**Open-Meteo** (free, no API key required, good forecast accuracy for planning purposes).
Call the forecast API with (lat, lng, start_date, end_date) and cache for 6 hours.
Display as a compact 5-day strip on the trip option card when dates are known.

For the Captain Tier "5-day trip forecast", use Weather.gov API for US locations (free,
government-backed) and fall back to Open-Meteo for international.

---

## 4. API Integrations — Priority Order

### P0 (MVP, must have in Phase 1)
- OpenAI / Anthropic — AI planning (already integrated via MCP)
- Neon PostgreSQL — database (already integrated)
- Stripe — payment collection (already integrated)

### P1 (Phase 2 — drives retention)
- **Ably** — real-time vote updates (2h integration, huge UX upgrade)
- **Resend** — transactional email for invites, payment requests, confirmations
- **Open-Meteo** — weather forecasts, free, no key
- **Google Maps Distance Matrix** — drive time from origin to destination
- **Google Places** — restaurants near courses

### P2 (Phase 3 — drives revenue)
- **GolfNow Partner API** — tee time availability check + affiliate booking links
  (Revenue share: GolfNow pays ~5-10% of booked green fees as affiliate commission)
- **TeeOff API** — alternative/backup to GolfNow; broader inventory in some markets
- **Booking.com Affiliate API** — lodging search + affiliate links
  (Revenue share: ~4-6% of booking value)
- **Twilio** — SMS notifications for group coordination
- **Stripe Connect** — platform payments for concierge booking

### P3 (Phase 4 — enterprise + scale)
- **Concur / SAP** — expense report integration for corporate tier
- **Amadeus Golf API** — international tee time inventory
- **CourseScorecard** — detailed course data enrichment
- **Yelp Fusion** — restaurant reviews near courses (supplement Google Places)

---

## 5. Mobile Strategy

**Decision: PWA first, native app if traction justifies it.**

Rationale: The demo-mobile page already proves the UX works at iPhone dimensions.
A PWA with proper manifest, service worker, and Web Push covers 90% of the mobile
use case without the App Store review cycle, separate codebase, or $99/year developer
account overhead.

**PWA requirements (Phase 2):**
- `manifest.json` with name, icons, `display: standalone`, `start_url: /`
- Service worker for offline caching of trip itinerary (so it works on the course)
- Web Push for vote and payment notifications
- Install prompt on mobile after second visit

**Mobile-first features (these should be designed for mobile before desktop):**
1. Vote page — swipe interface (already built)
2. Payment page — single-action pay button above the fold
3. Day-of itinerary — timeline view readable in sunlight
4. Post-trip score entry — quick input for 18 holes, no keyboard gymnastics

**Mobile-specific UX decisions:**
- Tee time reminder opens Apple Maps / Google Maps for directions with one tap
- "Share to Group Chat" button should use the native Web Share API
- Bottom navigation (not hamburger menus) for the main app
- All inputs must work with autofill and mobile keyboards (no custom date pickers
  that fight the browser)

**Native app threshold:** Build a native app when:
- 10,000+ MAU on mobile
- Push notification open rates are constrained by PWA permission friction
- Captain Tier users request it specifically (they will)
- Scorecard entry and live scoring during the round become a feature priority

---

## 6. Growth and Virality

### The fundamental viral loop

Every trip is a viral event. The Captain starts a trip for 8 people. Those 8 people
receive a vote link. 7 of them have never heard of TheCaddy.ai. They vote, see the
product, and one of them thinks "I need to plan our spring trip." He becomes the
next Captain. This is the core loop and it is already designed into the architecture.

**Amplification mechanics:**

1. "Powered by TheCaddy.ai" on the vote page
   - Not a footer footnote. A tasteful badge on the vote card header that says
     "Trip planning by TheCaddy.ai" with a link to start planning.
   - The vote page is the most-viewed page in the product (every group member sees it).
     It must be beautiful and it must attribute the tool.

2. Trip summary cards for social sharing
   - After locking a trip, generate an OG image: "Scottsdale Scramble 2026 — 8 Players
     — 4 Rounds — $1,250/person". Shareable to Instagram stories, X, group chats.
   - After the trip, the recap page generates another shareable: winner, low score, best
     moment. These get shared unprompted.

3. Referral program (Captain Tier)
   - "Refer a Captain, get 2 months free." The referral link goes to a landing page
     pre-filled with "Your friend [Name] invited you to try TheCaddy.ai for your next trip."
   - Only Captain-tier Captains can refer (they have brand equity invested). Free users
     referring gives too much away.

4. Course pro and golf concierge partnerships
   - Partner with 20-30 top golf resort concierges. When a guest books, the resort sends
     a TheCaddy.ai trip planning link for future trips. Revenue share with resort.
   - This is a B2B2C wedge into the Captain Tier.

5. Content loop — "The Caddy's Pick"
   - Weekly email: "Top 5 Golf Weekends Leaving From Atlanta This Spring." Generated by AI
     from trip brief templates + current pricing data. Builds the email list.
   - Each email CTA: "Plan Your Version." Deep links into the trip planner pre-seeded
     with the featured destination.

---

## 7. Product Roadmap

### Phase 1 — MVP (Weeks 1-4)

The infrastructure is largely built. Phase 1 is about making the existing pieces
production-quality and closing the most critical gaps.

**Must ship:**

- [ ] Real course database: seed 15 top US golf destinations with 10-30 courses each,
      stored in the `courses` table. Replace `need_research: true` with real data.
- [ ] Course images: add hero_image_url to course records (use Unsplash golf images
      keyed to destination as fallback, real course photos where licensed)
- [ ] Drive time integration: Google Maps Distance Matrix for origin → destination;
      display prominently on option cards
- [ ] Weather forecast on option cards: Open-Meteo integration, show 3-day forecast
      strip when trip dates are known
- [ ] AI model upgrade: switch Planner module from GPT-4o to Claude 3.5 Sonnet;
      update Extractor to Claude 3 Haiku for faster responses
- [ ] Trip persistence: save TripBrief + options to database on generation (currently
      only in localStorage via Zustand)
- [ ] Share link works without auth: the vote page already works; ensure trip data is
      readable without login by group members
- [ ] "Powered by TheCaddy.ai" branding on vote page: tasteful attribution badge
- [ ] Mobile-responsive vote page: already functional but needs polish on 375px screens
- [ ] Basic email via Resend: send vote invite and "trip locked" confirmation

**KPIs for Phase 1 completion:**
- At least one full trip flow completes end-to-end with real course data (no TBD)
- Vote page loads and functions on mobile in under 2 seconds
- 3 internal test trips planned and shared with real (non-dev) users

### Phase 2 — Growth (Weeks 5-12)

**Must ship:**

- [ ] Real-time vote updates via Ably (or SSE): live tally on vote page without refresh
- [ ] AI Negotiator activation: the Negotiator module exists in the spec but is not wired
      into the main flow. Connect it: after votes are collected, the AI proposes a
      final recommendation with conflict resolution
- [ ] PWA manifest + service worker: installable on mobile, offline itinerary cache
- [ ] SMS notifications via Twilio: vote invite, payment due, trip locked
- [ ] Pricing tiers: implement Free vs Pro gating via Stripe Billing; Pro plan activates
      unlimited trips, Negotiator, weather, and payment collection
- [ ] GolfNow availability check: show "tee times available" badge on option cards for
      Pro users (affiliate link, not booking yet)
- [ ] Restaurant recommendations: Google Places integration for "near course" suggestions
      added to itinerary days
- [ ] Post-trip recap page: score entry, photo upload, AI-generated trip summary
      (Captain Tier only)
- [ ] Referral system: unique referral link per Captain Tier user, tracked in DB
- [ ] OG image generation: dynamic trip summary image for social sharing using `@vercel/og`
- [ ] Dashboard improvements: add upcoming weather widget, "people haven't voted" alert,
      countdown to trip date
- [ ] Analytics: PostHog or Mixpanel event tracking (trip started, options generated,
      votes cast, payment completed, trip locked)

**KPIs for Phase 2 completion:**
- 100 trips planned by real users
- 40% of trips share the vote link with at least 3 group members
- 10% free-to-Pro conversion within 30 days of first trip
- NPS from Trip Captains >= 50

### Phase 3 — Monetization (Weeks 13-24)

**Must ship:**

- [ ] Concierge booking (Captain Tier): form to request TheCaddy.ai to book tee times
      and lodging on behalf of the group; email-based workflow initially, not automated
- [ ] Stripe Connect: handle payment collection for concierge bookings where TheCaddy.ai
      is the merchant
- [ ] Lodging search: Booking.com affiliate API integration; show 3-5 lodging options
      alongside course options
- [ ] Budget optimizer: for Captain Tier, add a "Maximize Your Budget" mode that
      re-runs the Planner with explicit cost/value optimization
- [ ] Custom branding (Captain Tier): trip pages with custom group name, photo, and
      accent color; removes "Powered by TheCaddy.ai" badge
- [ ] Enterprise tier launch: white-label, bulk booking, expense report export
- [ ] Multi-round planning: 4-5 day trip planning with 4+ courses, pairings management
      (Captain Tier)
- [ ] Handicap-aware tee groupings: given a roster with handicaps, suggest optimal
      pairings for competitive formats (scramble, best ball, stroke play)
- [ ] Captain Tier trial: 14-day free trial triggered when a free-tier Captain's trip
      exceeds 6 group members (the "you need the real tool" moment)
- [ ] Content marketing: "The Caddy's Pick" weekly email, 10 destination guides
      as SEO-optimized landing pages

**KPIs for Phase 3 completion:**
- $10,000 MRR
- 500 active Pro/Captain subscribers
- 3 enterprise accounts signed
- Concierge bookings: 20 trips per month with >$0 booking commission earned

### Phase 4 — Scale (Months 6-12)

**Must ship:**

- [ ] Native iOS/Android app: once PWA push notification friction becomes measurable,
      ship native apps focused on the mobile-only use cases (day-of itinerary, score
      entry, voting)
- [ ] Live scoring during the round: optional add-on where players enter scores hole-by-hole
      via mobile; AI calculates running results, announces winners in-app
- [ ] International destinations: expand course database to Canada, Scotland, Ireland,
      Mexico (Cabo), Dominican Republic — the five most common international group golf
      destinations for US travelers
- [ ] Tee time booking: direct booking integration (not just affiliate links) via GolfNow
      Connect API; TheCaddy.ai takes the booking fee
- [ ] Smart lodging booking: Airbnb and Vrbo API access for house rentals (the dominant
      lodging preference for groups per spec data); commission on bookings
- [ ] Trip templates: "Clone Last Year's Trip" with one click; auto-adjust dates, update
      course availability, re-invite same group
- [ ] Corporate analytics dashboard: full enterprise tier dashboard with trip ROI,
      spend by client, utilization reports
- [ ] AI course reviewer: "Ask about this course" feature; AI answers questions about
      layout difficulty, pace of play, dress code using RAG over course database
- [ ] Group handicap management: persistent roster with handicap history across trips;
      auto-update from GHIN API

**KPIs for Phase 4 completion:**
- $100,000 MRR
- 5,000 active paid subscribers
- 25+ enterprise accounts
- Direct tee time bookings generating >$50K revenue
- App Store rating >= 4.7

---

## 8. Success Metrics

### Conversion Funnel Targets

```
Landing Page Visit
    |
    | 40% → Start Trip (begin planning flow)
    |
    v
Trip Brief Complete (Extractor done, all required fields filled)
    |
    | 75% → Options Generated (make it to S3)
    |
    v
Options Generated
    |
    | 65% → At Least 1 Option Selected
    |
    v
Option Selected
    |
    | 55% → Share Link Created (trip shared with group)
    |
    v
Share Link Created
    |
    | 70% → At Least 2 Group Members Vote
    |
    v
Group Voting Complete
    |
    | 45% → Trip Locked
    |
    v
Trip Locked
    |
    | 30% → Upgrade to Pro/Captain within 30 days
    |
    v
Paid Subscriber
```

### Phase-by-Phase KPI Targets

**Phase 1 (Month 1):**
- Trips started: 50
- Trips with real (non-TBD) course data: 50
- Vote links shared: 20
- Group members who voted (across all trips): 80
- Paying users: 0 (MVP is free)

**Phase 2 (Month 3):**
- MAU: 500
- Trips planned: 300 cumulative
- Free → Pro conversions: 30
- MRR: $300
- Vote page NPS: >50
- Share rate (trips with >1 voter): >50%

**Phase 3 (Month 6):**
- MAU: 2,000
- MRR: $10,000
- Pro + Captain subscribers: 500
- Enterprise accounts: 3
- Average revenue per Captain: $19.99/mo
- Concierge trips booked: 20/month
- Affiliate revenue (GolfNow + lodging): $2,000/month

**Phase 4 (Month 12):**
- MAU: 15,000
- MRR: $100,000
- ARR run rate: $1.2M
- Paid subscribers: 5,000
- Enterprise accounts: 25 (avg $99/mo each)
- Direct booking GMV: $500K/month
- Booking revenue (10% take rate): $50K/month
- NPS from Captains: >65

### Revenue Model at Scale

```
Revenue Stream              Month 6    Month 12
─────────────────────────────────────────────────
Pro subscriptions           $4,000     $30,000
Captain subscriptions       $3,000     $30,000
Enterprise licenses         $1,500     $25,000
Per-trip purchases          $1,000      $5,000
GolfNow affiliate            $500      $10,000
Lodging affiliate            $500       $8,000
Concierge booking markup    $1,000      $15,000
─────────────────────────────────────────────────
Total MRR                  $11,500    $123,000
```

---

## 9. The Single Most Important Decision

The spec, the codebase, and this vision document all point to the same critical path:

**The inventory problem is the blocker. The AI is ready. The UX is close. The business
model is proven. The thing that makes "I planned a legendary golf weekend in 12 minutes"
actually true is having real course data behind the Planner.**

Until the Planner returns real courses with real prices and real drive times, every trip
ends with `need_research: true` and the Commissioner has to do the research themselves.
That is the thing the product is supposed to eliminate.

**The immediate next action is:** Seed the `courses` table with real data for the 15
top US golf travel destinations. This is a one-time data task, not an engineering task.
It can be done with a combination of USGA course database export, GolfNow public listings,
and manual curation. It takes one person two to three days. It unlocks the entire product.

Everything else in this document — the real-time voting, the payment flows, the mobile app,
the enterprise tier — is real and valuable. But the course database is the keystone.
Pull that out and the arch falls. Put it in and the rest holds.

---

## Appendix A: Brand Voice

TheCaddy.ai voice: competent, calm, slightly sarcastic, always on your side.

**Examples of the voice done right:**

User: "8 guys, Scottsdale, May"
AI: "Classic. What's the budget situation — are we going full resort mode or trying to
sneak some value rounds in?"

User: "About $1,200 per person"
AI: "That's a solid number. You can play Troon and one bucket-list round, or spread it
across four courses and have money left for a decent steak. Which direction are you
leaning?"

User: "Some guys want to keep it cheap"
AI: "Understood — I'll build you a base plan that works for everyone, with one optional
upgrade round for the guys who want to splurge. Mike can order off the premium menu,
Dave doesn't have to."

**Anti-patterns to avoid:**
- Never say "Great choice!" or "Awesome!" — it sounds like a chatbot
- Never apologize ("I'm sorry, I couldn't find...") — the Caddy finds a way
- Never use bullet lists in conversational responses — it sounds like a form
- Never show the state machine to the user — they don't care that we're in S2_ASSUMPTIONS

---

## Appendix B: Competitive Positioning

**GolfNow:** Tee time marketplace. No trip planning, no group coordination, no itinerary.
TheCaddy.ai sends golfers TO GolfNow as an affiliate. Not a competitor — a distribution
channel.

**TripAdvisor / Google Travel:** Generic trip planning. No golf expertise, no group voting,
no tee time awareness. The Caddy wins on depth and specificity.

**Vacasa / VRBO:** Lodging rental. No golf awareness. Integrate as a lodging data source.

**GolfLogix / Arccos:** On-course GPS and analytics. Post-round tools. Different phase of
the golfer's journey. Potential integration partner for the recap/scoring feature.

**Group messaging apps (GroupMe, WhatsApp):** This is the real competition. The Captain
currently plans the trip in text threads. TheCaddy.ai replaces the thread with a
structured, AI-facilitated process that produces better outcomes with less friction.
The vote page and fund system exist specifically to eliminate the "27 unread messages
about whether to book the house" moment.

**The defensible moat:** Course database + trip planning intelligence + group coordination
workflow, combined. Any one of these is replicable. All three together, trained on
real trip data, is compounding.

---

*TheCaddy.ai — "How did I ever plan a trip without this?"*
