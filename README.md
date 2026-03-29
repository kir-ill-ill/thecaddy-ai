# TheCaddy.AI - AI Golf Trip & Outing Planner

> **"I planned a legendary golf weekend in 12 minutes."**

TheCaddy.AI is an AI-powered golf trip planning assistant that eliminates the friction of organizing group golf outings. Using advanced AI agents, it transforms messy group chats into actionable itineraries with minimal effort.

## Features

### Core AI Modules

1. **TripBrief Extractor** - Converts freeform user input into structured trip requirements
2. **Trip Planner** - Generates 2-3 differentiated trip options with full itineraries and cost breakdowns
3. **Negotiator** - Reconciles group conflicts and produces consensus-driven recommendations

### User Experience

- **Conversational Planning** - Natural chat interface for trip planning
- **Smart Options** - AI generates meaningfully different trip packages (Best Fit / Best Value / Best Experience)
- **Group Coordination** - Collect votes, manage conflicts, reach consensus
- **Beautiful UI** - Golf-themed design with forest green, sand, and gold palette
- **Demo Mode** - Interactive demo showcasing the full planning workflow

## Tech Stack

- **Framework**: Next.js 14 (React 18, TypeScript)
- **AI**: OpenAI GPT-4o (latest model)
- **Architecture**: MCP (Model Context Protocol) Server
- **Desktop**: Tauri (native macOS application)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod (for JSON schema validation)

## Platforms

### Web Application
Modern web interface with conversational AI trip planning.

### macOS Desktop App
Native macOS application built with Tauri featuring:
- **Mobile-optimized interface** (430x932px window - iPhone 14 Pro Max size)
- **Four main tabs**: Dashboard, Roster, Vote, Itinerary
- **Forest green theme** (#1A4D2E) matching the demo.html design
- **Lightweight bundle** (~600KB, compared to Electron's ~50MB)

See [MACOS_APP_SETUP.md](./MACOS_APP_SETUP.md) for build instructions.

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd caddyAI
```

2. Install Next.js app dependencies:
```bash
npm install
```

3. Install MCP server dependencies:
```bash
cd mcp-server
npm install
npm run build
cd ..
```

4. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

Also set up the MCP server env:
```bash
cd mcp-server
cp .env.example .env
# Edit .env and add your OpenAI API key
cd ..
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
caddyAI/
├── app/
│   ├── api/
│   │   ├── extract/      # TripBrief Extractor API (uses MCP)
│   │   ├── plan/         # Trip Planner API (uses MCP)
│   │   └── negotiate/    # Negotiator API (uses MCP)
│   ├── planner/          # Main trip planning interface
│   ├── demo/             # Interactive demo
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ChatInterface.tsx     # Conversational planning UI
│   └── TripOptionCard.tsx    # Trip option display
├── lib/
│   ├── types.ts          # TypeScript types (from JSON schemas)
│   ├── store.ts          # Zustand state management
│   ├── prompts.ts        # AI system prompts
│   └── mcp-client.ts     # MCP client integration
├── mcp-server/           # MCP Server
│   ├── src/
│   │   └── index.ts      # MCP server implementation
│   ├── package.json      # MCP server dependencies
│   └── README.md         # MCP server docs
├── demo.html             # Original demo (reference)
├── thecaddy_ai_spec.md   # Complete technical specification
├── mcp-config.json       # MCP configuration for Claude Desktop
└── README.md
```

## MCP Architecture

TheCaddy.AI uses the **Model Context Protocol (MCP)** for AI operations. This provides:

### Benefits
- **🔌 Decoupled Architecture** - AI logic lives in a separate MCP server
- **♻️ Reusability** - The MCP server can be used by multiple clients (web app, Claude Desktop, etc.)
- **📋 Standardization** - Follows the official MCP specification
- **🚀 Scalability** - Server can be deployed and scaled independently
- **🧪 Testability** - Tools can be tested in isolation
- **🔧 Extensibility** - Add new tools without changing the client

### How It Works

```
┌─────────────────┐
│  Next.js App    │
│  (Web Client)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   API Routes    │
│  (/api/*)       │
└────────┬────────┘
         │ MCP Client
         ▼
┌─────────────────┐
│   MCP Server    │
│  (mcp-server/)  │
└────────┬────────┘
         │ OpenAI SDK
         ▼
┌─────────────────┐
│  OpenAI GPT-4o  │
└─────────────────┘
```

### MCP Tools

The MCP server exposes three tools:
1. **extract_trip_brief** - Extracts structured data from user input
2. **plan_trip_options** - Generates 2-3 trip options
3. **negotiate_plan** - Resolves conflicts and produces recommendations

See `mcp-server/README.md` for detailed documentation.

## API Routes

### POST /api/extract
Extracts structured trip information from user input.

**Request:**
```json
{
  "schema_version": "1.0",
  "user_message": "Planning a golf trip to Scottsdale for 8 guys in May",
  "chat_context": {},
  "locale": "en-US",
  "now_date": "2025-01-15"
}
```

**Response:**
```json
{
  "schema_version": "1.0",
  "trip_brief": { ... },
  "missing_fields": ["dates.start", "budget.per_person"],
  "follow_up_question": "What's your target budget per person?"
}
```

### POST /api/plan
Generates 2-3 trip options based on trip brief.

**Request:**
```json
{
  "schema_version": "1.0",
  "trip_brief": { ... },
  "inventory_context": {},
  "scoring_weights": { ... }
}
```

**Response:**
```json
{
  "schema_version": "1.0",
  "options": [ ... 2-3 TripOption objects ... ],
  "ranked_option_ids": ["opt_a", "opt_b", "opt_c"]
}
```

### POST /api/negotiate
Reconciles group conflicts and produces final recommendation.

**Request:**
```json
{
  "schema_version": "1.0",
  "trip_brief": { ... },
  "shortlist": [ ... ],
  "group_responses": { ... }
}
```

**Response:**
```json
{
  "schema_version": "1.0",
  "strategies": [ ... ],
  "final_recommendation": { ... },
  "follow_up_needed": false
}
```

## State Machine

The planning flow follows a defined state machine:

1. **S0_START** - Initial state
2. **S1_INTAKE** - Gathering trip requirements
3. **S2_ASSUMPTIONS** - Setting guardrails and assumptions
4. **S3_GENERATION** - AI generating trip options
5. **S4_PRESENTATION** - User reviewing options
6. **S5_GROUP_INVITE** - Collecting group preferences
7. **S6_CONFLICT_RESOLUTION** - Resolving conflicts
8. **S7_LOCK_PLAN** - Finalizing itinerary
9. **S8_BOOKING** - Ready for booking

## Design Philosophy

### "One Question Rule"
The AI asks **one question at a time** to avoid overwhelming users, unless the user explicitly requests batch input.

### Data Contracts
All AI responses conform to strict JSON schemas defined in `lib/types.ts`, ensuring predictable behavior and easy validation.

### Prompt Engineering
System prompts are carefully crafted to:
- Prevent hallucination of prices/courses
- Ask targeted follow-up questions
- Generate meaningfully differentiated options
- Reconcile conflicts diplomatically

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Roadmap

- [ ] Integrate real course/lodging data (via Golf Now, TripAdvisor APIs)
- [ ] Add pricing integration
- [ ] Implement group invitation system
- [ ] Build booking hand-off (affiliate links)
- [ ] Add authentication and trip persistence
- [ ] Mobile app (React Native)
- [ ] Agent-based architecture (separate Scout, Treasurer, etc.)

## Documentation

See `thecaddy_ai_spec.md` for the complete technical specification including:
- Detailed JSON schemas
- Validation rules
- System prompts
- Implementation notes

## License

Proprietary - All rights reserved

## Support

For questions or issues, please contact [support email]

---

Built with Claude Code and OpenAI GPT-4 🏌️‍♂️
