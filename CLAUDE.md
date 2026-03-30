# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TheCaddy.AI is an AI-powered golf trip and outing planner that transforms group planning chaos into actionable itineraries. It uses conversational AI to extract trip requirements, generate options, and resolve group conflicts.

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint

# MCP Server (legacy -- no longer required for AI operations)
# cd mcp-server && npm install && npm run build  # First-time setup
# cd mcp-server && npm run dev                   # Run MCP server

# Tauri Desktop App (requires Rust)
npm run tauri:dev        # Launch native macOS app
npm run tauri:build      # Build .dmg for distribution
```

## Architecture

### State Machine Flow
The app follows a 9-state planning workflow defined in `lib/store.ts`:
S0_START → S1_INTAKE → S2_ASSUMPTIONS → S3_GENERATION → S4_PRESENTATION → S5_GROUP_INVITE → S6_CONFLICT_RESOLUTION → S7_LOCK_PLAN → S8_BOOKING

### AI Architecture (Anthropic Claude)
```
Next.js App → API Routes (/api/*) → lib/claude.ts → Anthropic Claude API
```

Direct Anthropic API calls via `lib/claude.ts` (no MCP indirection):
- **`/api/extract`**: Claude Haiku (`claude-haiku-4-5-20251001`) -- fast TripBrief extraction
- **`/api/plan`**: Database planner with Claude Sonnet (`claude-sonnet-4-6-20250326`) fallback
- **`/api/negotiate`**: Claude Sonnet (`claude-sonnet-4-6-20250326`) -- group conflict resolution

System prompts and prompt builders live in `lib/prompts.ts`.

> Legacy: `mcp-server/` and `lib/mcp-client.ts` still exist but are no longer the primary AI path.

### Key Files
- `lib/claude.ts` - Anthropic Claude API wrapper (callClaude helper)
- `lib/prompts.ts` - System prompts and prompt builders for all AI operations
- `lib/types.ts` - TypeScript types matching JSON schemas from spec
- `lib/store.ts` - Zustand state management (persisted to localStorage)
- `lib/validation.ts` - Zod schemas for all data contracts
- `lib/planner.ts` - Trip option generation with geospatial scoring (Haversine formula)
- `lib/db.ts` - Neon PostgreSQL database queries
- `lib/errors.ts` - Structured error handling with ErrorCode enum
- `middleware.ts` - Rate limiting (100 req/min) and security headers

### API Routes
| Route | Purpose |
|-------|---------|
| `/api/extract` | TripBrief extraction |
| `/api/plan` | Generate trip options |
| `/api/negotiate` | Group conflict resolution |
| `/api/trips/*` | Trip CRUD and voting |
| `/api/funds/*` | Trip funding pools |
| `/api/payments/*` | Stripe checkout and webhooks |
| `/api/auth/*` | NextAuth.js authentication |
| `/api/user/trips` | Get user's trips |
| `/api/user/profile` | User profile management |

### Authentication System
Uses NextAuth.js v5 with multiple providers:
- **Credentials**: Email/password login with bcrypt hashing
- **Google OAuth**: Social login via Google
- **Magic Link**: Passwordless email authentication

Key auth files:
- `auth.ts` - NextAuth configuration
- `lib/auth-db.ts` - Auth database operations (users, sessions, accounts)
- `app/login/page.tsx` - Login/signup UI with all auth methods
- `app/dashboard/page.tsx` - User dashboard with trip panels
- `app/profile/page.tsx` - Profile settings page
- `components/Providers.tsx` - SessionProvider wrapper

Database tables for auth:
- `users` - User accounts
- `accounts` - OAuth provider links
- `sessions` - User sessions
- `verification_tokens` - Magic link tokens
- `trip_members` - Links users to trips (role: owner/member)

## Environment Variables

Required in `.env.local`:
- `ANTHROPIC_API_KEY` - For Claude AI operations (extraction, planning, negotiation)
- `DATABASE_URL` - Neon PostgreSQL connection
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` - Payment processing
- `NEXTAUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - App URL (http://localhost:3000 in dev)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth (optional)

`USE_MOCK_DATA=true` (default) skips real API calls for cost optimization.

## Development Notes

- AI calls go directly through `lib/claude.ts` -- no MCP server needed for normal operation
- Demo UI at `/demo-mobile` is what Tauri loads (430x932px iPhone-sized window)
- All AI responses validated against Zod schemas - never skip validation
- Use `CaddyError` with `ErrorCode` for consistent error handling
- The `thecaddy_ai_spec.md` contains complete JSON schemas and AI prompts
- Auth requires `SessionProvider` wrapper in layout (see `components/Providers.tsx`)
- Protected routes should use `useSession()` hook and redirect if unauthenticated
