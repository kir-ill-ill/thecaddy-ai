import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let mcpClient: Client | null = null;

export async function getMCPClient(): Promise<Client> {
  if (mcpClient) {
    return mcpClient;
  }

  // Use process.execPath to get the current Node.js executable path
  const transport = new StdioClientTransport({
    command: process.execPath, // Use the current Node.js executable
    args: [process.cwd() + '/mcp-server/dist/index.js'],
    env: {
      ...process.env,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    },
  });

  // Create client
  mcpClient = new Client(
    {
      name: 'thecaddy-ai-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await mcpClient.connect(transport);

  return mcpClient;
}

export async function callMCPTool(toolName: string, args: any): Promise<any> {
  const client = await getMCPClient();

  const result = await client.callTool({
    name: toolName,
    arguments: args,
  });

  // Extract text content from result
  const textContent = result.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in MCP response');
  }

  return JSON.parse(textContent.text);
}
