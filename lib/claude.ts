import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(params: {
  system: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
}) {
  const response = await anthropic.messages.create({
    model: params.model || 'claude-sonnet-4-6-20250326',
    max_tokens: params.maxTokens || 4096,
    system: params.system,
    messages: [{ role: 'user', content: params.userMessage }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}
