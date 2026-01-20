// Netlify serverless function for extracting a brief from a braindump
// Environment variable ANTHROPIC_API_KEY must be set in Netlify dashboard

import Anthropic from '@anthropic-ai/sdk';
import { editorPersona } from './shared/system-prompts.js';

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

    // Build the prompt
    const prompt = buildExtractPrompt(braindump);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: editorPersona,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text response
    const rawResponse = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    // Try to parse as JSON
    let result;
    try {
      let jsonStr = rawResponse;

      // Remove markdown code blocks if present
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.log('JSON parse failed, using fallback:', parseError.message);
      result = {
        coreConcept: 'Could not extract - please review your braindump',
        premise: '',
        worldAndTone: ''
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        coreConcept: result.coreConcept || '',
        premise: result.premise || '',
        worldAndTone: result.worldAndTone || '',
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to extract brief',
        details: error.message
      })
    };
  }
}

function buildExtractPrompt(braindump) {
  return `You are helping a novelist extract the essential elements from their raw braindump.

## The Writer's Braindump
${braindump}

## Your Task
Read through this braindump and extract three key elements. Be concise and specific to THIS story idea.

**Response Format:**
Return ONLY valid JSON in this exact format (no markdown code blocks, no extra text):
{
  "coreConcept": "1-2 sentences capturing the central idea or hook of the story",
  "premise": "1-2 sentences describing the 'what if' that drives this story",
  "worldAndTone": "1-2 sentences about the setting, atmosphere, and emotional feel"
}

**Guidelines:**
- Extract, don't invent. Use what's in the braindump.
- If something isn't clear from the braindump, make a reasonable inference and note it
- Be specific to THIS story, not generic writing advice
- Keep each field to 1-2 sentences max

Return the JSON now:`;
}
