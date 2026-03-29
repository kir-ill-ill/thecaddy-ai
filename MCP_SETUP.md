# MCP Setup Guide for TheCaddy.AI

This guide explains how to set up and use the MCP (Model Context Protocol) server with TheCaddy.AI.

## What is MCP?

The Model Context Protocol is a standard protocol for connecting AI assistants with external tools and data sources. It provides a unified way for AI models to access capabilities beyond their training data.

## Architecture Overview

TheCaddy.AI uses MCP to separate AI logic from the web application:

```
Web App (Next.js) → MCP Client → MCP Server → OpenAI GPT-4o
```

## Setup Steps

### 1. Install MCP Server Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `mcp-server/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Build the Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in `mcp-server/dist/`.

### 4. Run the Server (Standalone)

For testing or development:

```bash
npm run dev
```

The server runs on stdio and waits for MCP protocol messages.

### 5. Use with Next.js App

The Next.js app automatically spawns the MCP server when needed via `lib/mcp-client.ts`. Just run:

```bash
# From the root directory
npm run dev
```

## Using with Claude Desktop

### macOS Setup

1. Build the MCP server:
```bash
cd mcp-server
npm run build
```

2. Find your Claude Desktop config:
```bash
open ~/Library/Application\ Support/Claude/
```

3. Edit `claude_desktop_config.json`:
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

4. Restart Claude Desktop

5. The MCP tools will appear in Claude Desktop's tools menu

### Windows Setup

1. Build the MCP server (same as macOS)

2. Find config at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

3. Use Windows paths:
```json
{
  "mcpServers": {
    "thecaddy-ai": {
      "command": "node",
      "args": [
        "C:\\path\\to\\caddyAI\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

## Available Tools

### extract_trip_brief

Converts natural language into structured trip data.

**Example:**
```
User: "I want to plan a golf trip to Arizona for 6 people in March with $1500 budget"
→ Returns structured TripBrief JSON
```

### plan_trip_options

Generates 2-3 differentiated trip packages.

**Example:**
```
Input: Complete TripBrief
→ Returns 3 options: "Best Fit", "Best Value", "Best Experience"
```

### negotiate_plan

Resolves group conflicts and produces final plan.

**Example:**
```
Input: TripBrief + Shortlist + Group feedback
→ Returns resolution strategies and final recommendation
```

## Development

### Running in Dev Mode

```bash
cd mcp-server
npm run dev
```

This uses `tsx` for auto-reload during development.

### Testing Tools

You can test MCP tools using the MCP Inspector or by calling them from the Next.js app.

### Adding New Tools

1. Edit `mcp-server/src/index.ts`
2. Add tool definition to `tools` array
3. Add handler in `CallToolRequestSchema` switch statement
4. Rebuild: `npm run build`

## Troubleshooting

### Server Not Starting

- Check that `OPENAI_API_KEY` is set in both `.env.local` and `mcp-server/.env`
- Ensure Node.js 18+ is installed
- Run `npm install` in both root and `mcp-server/` directories

### Tools Not Appearing in Claude Desktop

- Verify the absolute path in `claude_desktop_config.json`
- Check that `mcp-server/dist/index.js` exists (run `npm run build`)
- Restart Claude Desktop completely
- Check Claude Desktop logs for errors

### API Errors

- Enable detailed error logging in `lib/mcp-client.ts`
- Check browser console for client-side errors
- Verify OpenAI API key is valid and has credits

## Benefits of MCP

✅ **Modularity** - AI logic is separate from web app
✅ **Reusability** - Same server works with multiple clients
✅ **Standardization** - Follows MCP protocol
✅ **Scalability** - Can deploy server independently
✅ **Testability** - Test tools in isolation
✅ **Extensibility** - Easy to add new capabilities

## Next Steps

- Add more MCP tools (course search, booking, etc.)
- Deploy MCP server to cloud (AWS Lambda, Cloud Run, etc.)
- Add authentication and rate limiting
- Implement caching for faster responses
- Add monitoring and logging

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP SDK on GitHub](https://github.com/modelcontextprotocol/sdk)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
