# Group Voting & Shareable Links - Feature Guide

## What Was Built

The **group voting system** allows trip organizers to share AI-generated trip options with their group and collect votes without requiring everyone to create accounts.

---

## How It Works

### 1. Organizer Creates Trip Options (`/trip`)
```
User: "I want to plan a golf trip to Scottsdale for 8 guys in May with $1200 budget"
AI: Generates 2-3 trip options with courses, lodging, pricing
User: Selects the options they want the group to vote on
User: Clicks "Share with Group"
System: Generates unique shareable link (e.g., /vote/trip_abc123)
```

### 2. Group Members Vote (`/vote/[id]`)
```
Member opens link → Enters their name → Votes for their favorite options
Can select multiple options (multi-select voting)
Sees live vote counts and percentages
After voting, sees who else has voted and current results
```

### 3. Organizer Reviews Results
```
Real-time vote aggregation
Options ranked by vote count
Consensus indicator (if 60%+ agree on one option)
List of who has/hasn't voted
```

---

## User Flow Example

### Step 1: Create & Share
```bash
1. Go to http://localhost:3000/trip
2. Chat with AI to create trip options
3. Select 2-3 options for group voting
4. Click "Share with Group"
5. Copy shareable link: http://localhost:3000/vote/trip_1234567_abc123
6. Send link to group chat (text, email, Slack, etc.)
```

### Step 2: Group Votes
```
Mike opens link:
  - Enters name: "Mike Ross"
  - Votes for: Option A, Option B
  - Sees results: Option A (3 votes), Option B (5 votes), Option C (1 vote)

Harvey opens link:
  - Enters name: "Harvey Specter"
  - Votes for: Option B
  - Sees updated results: Option A (3), Option B (6), Option C (1)

Rachel opens link:
  - Enters name: "Rachel Zane"
  - Votes for: Option B
  - Sees "Clear favorite!" badge (Option B has 60%+ consensus)
```

### Step 3: Organizer Locks Plan
```
Organizer checks vote results
Option B wins with 7/10 votes (70%)
Organizer proceeds to lock the plan
(Next phase: PDF export + calendar sync)
```

---

## Technical Architecture

### File-Based Storage
Trips are stored as JSON files in `/data/trips/`:

```json
{
  "id": "trip_1736195283456_abc123",
  "tripBrief": {
    "trip_name": "Scottsdale Scramble '25",
    "destination": { "city": "Scottsdale", "state": "AZ" },
    "party": { "players": 8 },
    "budget": { "per_person": 1200 }
  },
  "options": [
    {
      "id": "opt_a",
      "title": "Troon North Package",
      "courses": [...],
      "cost_estimate": { "per_person_estimated": 1180 }
    }
  ],
  "votes": {
    "voter_123": {
      "name": "Mike Ross",
      "votedFor": ["opt_a", "opt_b"],
      "timestamp": "2025-01-06T20:30:00Z"
    },
    "voter_456": {
      "name": "Harvey Specter",
      "votedFor": ["opt_b"],
      "timestamp": "2025-01-06T20:35:00Z"
    }
  },
  "createdAt": "2025-01-06T20:00:00Z",
  "updatedAt": "2025-01-06T20:35:00Z"
}
```

### API Endpoints

**POST /api/trips** - Create shareable trip
```typescript
Body: { tripBrief, options, selectedOptions, creatorName }
Response: { success: true, tripId, shareUrl: "/vote/trip_123" }
```

**GET /api/trips/[id]** - Load trip data
```typescript
Response: { id, tripBrief, options, votes, createdAt, updatedAt }
```

**POST /api/trips/[id]/vote** - Submit vote
```typescript
Body: { voterId, voterName, optionIds }
Response: { success: true, trip, voteSummary }
```

**GET /api/trips/[id]/vote** - Get vote results
```typescript
Response: {
  trip,
  voteSummary: {
    optionVotes: { "opt_a": 3, "opt_b": 5 },
    voters: { "voter_123": "Mike Ross" },
    totalVoters: 8,
    rankedOptions: [{ optionId: "opt_b", votes: 5 }],
    consensus: true
  }
}
```

---

## Features

✅ **No Login Required** - Voters just enter their name
✅ **Multi-Select Voting** - Vote for multiple options
✅ **Real-Time Results** - See live vote counts
✅ **Consensus Detection** - Highlights when 60%+ agree
✅ **Voter Tracking** - See who has/hasn't voted
✅ **Unique Voter IDs** - Stored in localStorage, can't double-vote
✅ **Mobile-Friendly** - Works on any device
✅ **Copy-Paste Sharing** - One-click link copy

---

## UX Highlights

### Vote Page (`/vote/[id]`)
- **Header**: Trip name, destination, vote count, consensus badge
- **Voter Input**: Name entry (required before voting)
- **Option Cards**:
  - Course list, lodging, pricing, "Why This Works" tags
  - Live vote progress bars
  - Selected state (emerald border)
  - Click to toggle selection
- **Submit Button**: Shows count of selected options
- **Thank You View**:
  - Ranked results with percentages
  - Who has voted (name badges)
  - Automatic refresh when new votes come in (future: WebSockets)

### Share Flow (`/trip`)
- **Select Options**: Multi-select trip options (green checkmarks)
- **Share Button**: Green CTA with "Share with Group"
- **Link Generated**: Copy button, shareable URL displayed
- **Instructions**: "Share via text, email, or group chat"

---

## Next Steps (Week 3)

### Immediate Enhancements:
1. **Real-time updates** - WebSocket for live vote refresh
2. **Email invites** - Send voting link via email
3. **SMS invites** - Text the link to group members
4. **Voting deadline** - Set time limit for votes
5. **Anonymous voting** - Option to hide who voted what

### Integration Features:
6. **PDF export** - Generate itinerary after voting
7. **Calendar sync** - .ics file for winners
8. **Payment collection** - Stripe integration for deposits
9. **Conflict resolution** - AI negotiation if no consensus

---

## Migration to Database (Future)

Current: JSON files in `/data/trips/`
Future: PostgreSQL or Supabase

**Migration path:**
```typescript
// Current
await saveTrip(trip); // Writes to /data/trips/trip_123.json

// Future
await prisma.trip.create({ data: trip }); // Writes to PostgreSQL
```

**Benefits of DB:**
- Faster queries
- Real-time subscriptions (WebSockets)
- Better concurrency (multiple votes at once)
- User accounts (track all trips per user)

---

## Testing

**Test the full flow:**

1. Open http://localhost:3000/trip
2. Enter: "Golf trip to Scottsdale for 8 guys, $1200 budget"
3. Wait for AI to generate 2-3 options
4. Select 2 options (click the cards)
5. Click "Share with Group"
6. Copy the shareable link
7. Open in incognito window (or different browser)
8. Enter your name, vote for options
9. See results update in real-time
10. Open original link again, see your vote counted

---

## What's Next?

Now that group voting works, we need to complete the MVP:

**Week 3 Priorities:**
1. ✅ PDF itinerary export
2. ✅ Stripe paywall ($99/year or $29/trip)
3. ✅ Trip library (save past trips)
4. ✅ Email/SMS invites

**Week 4 Features:**
5. Scorecard (during-trip scoring)
6. Photo album (trip memories)
7. Real course data (curated destinations)

You now have a **functional group planning tool** with AI trip generation + voting!
