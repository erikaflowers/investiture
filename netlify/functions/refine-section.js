// Netlify serverless function for refining a single section of the story concept
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
    const { sectionName, currentContent, direction, genome, braindump } = JSON.parse(event.body);

    if (!sectionName || !currentContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing section name or content' })
      };
    }

    // Build the prompt
    const prompt = buildRefinePrompt(sectionName, currentContent, direction, genome, braindump);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text response
    const refinedContent = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        refinedContent,
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to refine section',
        details: error.message
      })
    };
  }
}

function buildRefinePrompt(sectionName, currentContent, direction, genome, braindump) {
  // Format the genome into readable context
  const genomeText = formatGenome(genome);

  const directionText = direction
    ? `\n\n## Writer's Direction\nThe writer wants you to: ${direction}`
    : '';

  return `You are a story development assistant helping a novelist refine a specific section of their story concept.

## Section to Refine: ${sectionName}

### Current Version:
${currentContent}
${directionText}

## Story Context

### The Writer's Original Braindump:
${braindump || '(Not provided)'}

### Story Genome (structural choices):
${genomeText || '(Not provided)'}

## Your Task
Rewrite ONLY the "${sectionName}" section based on the writer's direction (if provided) or improve it while staying true to the story's DNA.

**Important Guidelines:**
- Return ONLY the refined content for this section, no headers or labels
- Maintain the same general purpose of this section type
- Stay grounded in the braindump and genome context
- If the writer gave direction, prioritize that
- If no direction given, make it tighter, more specific, or more compelling
- Use markdown formatting (*italics* for titles, **bold** for emphasis) as appropriate
- Keep approximately the same length unless the direction suggests otherwise

Write the refined "${sectionName}" now:`;
}

function formatGenome(genome) {
  if (!genome) return '';

  const sections = [];

  if (genome.genres && genome.genres.length > 0) {
    sections.push(`**Genre(s):** ${genome.genres.map(g => g.name).join(', ')}`);
  }

  if (genome.archetypes && genome.archetypes.length > 0) {
    sections.push(`**Story Archetype(s):** ${genome.archetypes.map(a => a.name).join(', ')}`);
  }

  if (genome.themes && genome.themes.length > 0) {
    sections.push(`**Theme(s):** ${genome.themes.map(t => t.name).join(', ')}`);
  }

  if (genome.tones && genome.tones.length > 0) {
    sections.push(`**Tone(s):** ${genome.tones.map(t => t.name).join(', ')}`);
  }

  if (genome.stakes && genome.stakes.length > 0) {
    sections.push(`**Stakes:** ${genome.stakes.map(s => s.name).join(', ')}`);
  }

  if (genome.humorRole && genome.humorRole.id !== 'none') {
    sections.push(`**Humor Role:** ${genome.humorRole.name}`);
    if (genome.humorStyles && genome.humorStyles.length > 0) {
      sections.push(`**Humor Style(s):** ${genome.humorStyles.map(h => h.name).join(', ')}`);
    }
  }

  return sections.join('\n');
}
