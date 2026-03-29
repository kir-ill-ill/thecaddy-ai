# TheCaddy.AI MCP Server

This is an MCP (Model Context Protocol) server for TheCaddy.AI golf trip planning.

## Architecture

The MCP server exposes three main tools:
- **extract_trip_brief** - Extracts structured trip information from user input
- **plan_trip_options** - Generates 2-3 differentiated trip options
- **negotiate_plan** - Reconciles group conflicts and produces recommendations

## Setup

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

### 3. Build the Server

```bash
npm run build
```

### 4. Test the Server (Development)

```bash
npm run dev
```

## Using with Claude Desktop

Add this to your Claude Desktop MCP configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "thecaddy-ai": {
      "command": "node",
      "args": [
        "/absolute/path/to/caddyAI/mcp-server/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

## Using with Next.js App

The Next.js application automatically connects to the MCP server via the MCP client in `lib/mcp-client.ts`. The API routes (`/api/extract`, `/api/plan`, `/api/negotiate`) use the MCP client to call the server tools.

## Tools

### extract_trip_brief

Extracts structured trip planning data from natural language.

**Input:**
```json
{
  "user_message": "Planning a golf trip to Scottsdale for 8 guys in May",
  "chat_context": {},
  "now_date": "2025-01-15"
}
```

**Output:**
```json
{
  "schema_version": "1.0",
  "trip_brief": { /* TripBrief object */ },
  "missing_fields": ["budget.per_person"],
  "follow_up_question": "What's your target budget per person?",
  "notes": "..."
}
```

### plan_trip_options

Generates trip options based on requirements.

**Input:**
```json
{
  "trip_brief": { /* Complete TripBrief */ },
  "inventory_context": { /* Course/lodging data */ }
}
```

**Output:**
```json
{
  "schema_version": "1.0",
  "options": [ /* 2-3 TripOption objects */ ],
  "ranked_option_ids": ["opt_a", "opt_b", "opt_c"],
  "notes": "..."
}
```

### negotiate_plan

Resolves conflicts and produces final recommendation.

**Input:**
```json
{
  "trip_brief": { /* TripBrief */ },
  "shortlist": [ /* Selected options */ ],
  "group_responses": { /* Group member feedback */ }
}
```

**Output:**
```json
{
  "schema_version": "1.0",
  "strategies": [ /* Resolution strategies */ ],
  "final_recommendation": { /* Final plan */ },
  "follow_up_needed": false
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Integration

The MCP server follows the standard MCP protocol and can be used with:
- Claude Desktop
- Other MCP-compatible clients
- The TheCaddy.AI Next.js application (via MCP client)

## Benefits of MCP Architecture

✅ **Separation of Concerns** - AI logic is decoupled from the web app
✅ **Reusability** - MCP server can be used by multiple clients
✅ **Standardization** - Follows MCP protocol specification
✅ **Scalability** - Server can be deployed independently
✅ **Testing** - Tools can be tested in isolation
✅ **Extensibility** - Easy to add new tools without changing the client
