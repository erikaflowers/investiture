// Netlify serverless function for generating a terse title from a braindump
// Environment variable ANTHROPIC_API_KEY must be set in Netlify dashboard

import Anthropic from '@anthropic-ai/sdk';

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' })
    };
  }

  try {
    const { braindump } = JSON.parse(event.body);

    if (!braindump) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing braindump' })
      };
    }

    // Call Claude API with haiku for speed
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: `Generate a short, memorable title (2-5 words) for this story idea. Return ONLY the title, nothing else.

Story idea:
${braindump.substring(0, 1000)}

Title:`
        }
      ]
    });

    // Extract text response
    const title = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim()
      .replace(/^["']|["']$/g, ''); // Remove quotes if present

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        title: title || 'Untitled Story',
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate title',
        details: error.message
      })
    };
  }
}
