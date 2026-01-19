// Netlify serverless function for calling Claude API
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
    const { braindump, genome } = JSON.parse(event.body);

    if (!braindump || !genome) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing braindump or genome' })
      };
    }

    // Build the prompt
    const prompt = buildPrompt(braindump, genome);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text response
    const conceptText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        concept: conceptText,
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate concept',
        details: error.message
      })
    };
  }
}

function buildPrompt(braindump, genome) {
  // Format the genome into readable sections
  const genomeText = formatGenome(genome);

  return `You are a story development assistant helping a novelist crystallize their initial idea into a coherent story concept.

## The Writer's Braindump
This is the raw, unfiltered idea dump from the writer:

${braindump}

## Story Genome
The writer has identified these structural elements for their story:

${genomeText}

## Your Task
Synthesize the braindump and genome into a **Story Concept** - the big-picture vision of what this story is about. This is NOT a full outline or character breakdown. It's the essential DNA of the story.

Please provide:

### Logline
A single sentence (25-35 words) that captures the core dramatic question. Format: "When [inciting incident], a [protagonist type] must [goal/action] or else [stakes]."

### Premise
2-3 sentences expanding on the central "what if" that drives this story. What's the hook that makes this story worth telling?

### Thematic Core
What is this story really about beneath the plot? What question or truth is it exploring? (1-2 sentences)

### Tonal Compass
How should this story feel? What's the emotional texture? Reference films, books, or other works that capture a similar vibe.

### The Promise
What experience are you promising the reader? What will they get from this story that they can't get elsewhere?

Be specific to THIS story. Avoid generic advice. Ground everything in the details from the braindump and the structural choices in the genome.`;
}

function formatGenome(genome) {
  const sections = [];

  if (genome.genres && genome.genres.length > 0) {
    sections.push(`**Genre(s):** ${genome.genres.map(g => `${g.name} - ${g.description}`).join('; ')}`);
  }

  if (genome.archetypes && genome.archetypes.length > 0) {
    sections.push(`**Story Archetype(s):** ${genome.archetypes.map(a => `${a.name} - ${a.description}`).join('; ')}`);
  }

  if (genome.themes && genome.themes.length > 0) {
    sections.push(`**Theme(s):** ${genome.themes.map(t => `${t.name} - ${t.description}`).join('; ')}`);
  }

  if (genome.tones && genome.tones.length > 0) {
    sections.push(`**Tone(s):** ${genome.tones.map(t => `${t.name} - ${t.description}`).join('; ')}`);
  }

  if (genome.stakes && genome.stakes.length > 0) {
    sections.push(`**Stakes:** ${genome.stakes.map(s => `${s.name} - ${s.description}`).join('; ')}`);
  }

  if (genome.humorRole && genome.humorRole.id !== 'none') {
    let humorText = `**Humor Role:** ${genome.humorRole.name} - ${genome.humorRole.description}`;
    if (genome.humorStyles && genome.humorStyles.length > 0) {
      humorText += `\n**Humor Style(s):** ${genome.humorStyles.map(h => `${h.name} - ${h.description}`).join('; ')}`;
    }
    sections.push(humorText);
  }

  return sections.join('\n\n');
}
