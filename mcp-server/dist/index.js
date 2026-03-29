#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// System prompts
const EXTRACTOR_PROMPT = `You are TheCaddy.ai's TripBrief Extractor.
Your job: convert messy human input into a strict TripBrief JSON object.
Rules:
- Output MUST be valid JSON matching the provided schema.
- Do NOT hallucinate specific course names, lodging names, or prices.
- If a required field is missing, return missing_fields and ask ONE concise follow-up question.
- Always preserve user intent (competitive vs casual, drive vs fly, etc.)
- Use ISO dates (YYYY-MM-DD).`;
const PLANNER_PROMPT = `You are TheCaddy.ai's Trip Planner.
Your job: produce 2–3 trip options that satisfy the TripBrief constraints.
Rules:
- Output MUST be valid JSON matching the schema.
- Do NOT hallucinate precise prices. Use estimate ranges.
- Prefer options that are meaningfully different: (best fit / best value / best vibes).
- Keep logistics sane: cluster courses within a reasonable radius.
- Include a score_breakdown to make ranking explainable.`;
const NEGOTIATOR_PROMPT = `You are TheCaddy.ai's Group Negotiator.
Your job: reconcile conflicts across dates, budget, and preferences without drama.
Rules:
- Output MUST be valid JSON matching the schema.
- Propose at most 3 resolution strategies, ranked.
- Use "base plan + upgrades" when budget disagreement exists.
- Provide a final_recommendation that is actionable and explains tradeoffs.`;
// Define MCP tools
const tools = [
    {
        name: 'extract_trip_brief',
        description: 'Extracts structured trip planning information from user input',
        inputSchema: {
            type: 'object',
            properties: {
                user_message: {
                    type: 'string',
                    description: 'The user\'s message about their golf trip',
                },
                chat_context: {
                    type: 'object',
                    description: 'Previous conversation context',
                    properties: {
                        known_trip_brief: { type: 'object' },
                        user_profile: { type: 'object' },
                    },
                },
                now_date: {
                    type: 'string',
                    description: 'Current date in YYYY-MM-DD format',
                },
            },
            required: ['user_message', 'now_date'],
        },
    },
    {
        name: 'plan_trip_options',
        description: 'Generates 2-3 differentiated golf trip options based on trip brief',
        inputSchema: {
            type: 'object',
            properties: {
                trip_brief: {
                    type: 'object',
                    description: 'Complete trip brief with requirements',
                },
                inventory_context: {
                    type: 'object',
                    description: 'Available courses and lodging data',
                },
            },
            required: ['trip_brief'],
        },
    },
    {
        name: 'negotiate_plan',
        description: 'Reconciles group conflicts and produces final recommendation',
        inputSchema: {
            type: 'object',
            properties: {
                trip_brief: {
                    type: 'object',
                    description: 'Original trip brief',
                },
                shortlist: {
                    type: 'array',
                    description: 'Shortlisted trip options',
                },
                group_responses: {
                    type: 'object',
                    description: 'Group member responses and preferences',
                },
            },
            required: ['trip_brief', 'shortlist', 'group_responses'],
        },
    },
];
// Create MCP server
const server = new Server({
    name: 'thecaddy-ai-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'extract_trip_brief': {
                const { user_message, chat_context = {}, now_date } = args;
                const prompt = `Extract trip planning information from this user message.

User Message: "${user_message}"

Chat Context: ${JSON.stringify(chat_context, null, 2)}

Current Date: ${now_date}

Return a JSON object with:
{
  "schema_version": "1.0",
  "trip_brief": { ... partial or complete TripBrief ... },
  "missing_fields": [ ... array of missing field paths ... ],
  "follow_up_question": "..." or null,
  "notes": "..."
}`;
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: EXTRACTOR_PROMPT },
                        { role: 'user', content: prompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.3,
                });
                const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'plan_trip_options': {
                const { trip_brief, inventory_context = {} } = args;
                const prompt = `Generate 2-3 differentiated golf trip options.

Trip Brief: ${JSON.stringify(trip_brief, null, 2)}

Inventory Context: ${JSON.stringify(inventory_context, null, 2)}

Return a JSON object with:
{
  "schema_version": "1.0",
  "options": [ ... 2-3 TripOption objects ... ],
  "ranked_option_ids": [ ... IDs in ranked order ... ],
  "notes": "..."
}`;
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: PLANNER_PROMPT },
                        { role: 'user', content: prompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7,
                    max_tokens: 4000,
                });
                const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'negotiate_plan': {
                const { trip_brief, shortlist, group_responses } = args;
                const prompt = `Reconcile group conflicts and produce final recommendation.

Trip Brief: ${JSON.stringify(trip_brief, null, 2)}

Shortlist: ${JSON.stringify(shortlist, null, 2)}

Group Responses: ${JSON.stringify(group_responses, null, 2)}

Return a JSON object with:
{
  "schema_version": "1.0",
  "strategies": [ ... 1-3 NegotiationStrategy objects ... ],
  "final_recommendation": { ... FinalRecommendation ... },
  "follow_up_needed": true/false,
  "follow_up_question": "..." or null
}`;
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: NEGOTIATOR_PROMPT },
                        { role: 'user', content: prompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.5,
                    max_tokens: 3000,
                });
                const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: errorMessage }, null, 2),
                },
            ],
            isError: true,
        };
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('TheCaddy.AI MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
