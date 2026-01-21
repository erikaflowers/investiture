// Netlify serverless function for generating beat sheet content
// Environment variable ANTHROPIC_API_KEY must be set in Netlify dashboard

import './shared/load-env.js';
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
    const {
      beatId,
      beatInfo,
      braindump,
      genome,
      storyConcept,
      characters,
      existingBeats
    } = JSON.parse(event.body);

    if (!beatId || !beatInfo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing beat ID or beat info' })
      };
    }

    // Build the prompt
    const prompt = buildBeatPrompt({
      beatInfo,
      braindump,
      genome,
      storyConcept,
      characters,
      existingBeats
    });

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
    const content = message.content
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
        content,
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Generate beat error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate beat',
        details: error.message
      })
    };
  }
}

function buildBeatPrompt({ beatInfo, braindump, genome, storyConcept, characters, existingBeats }) {
  // Format characters
  const characterList = characters && characters.length > 0
    ? characters.map(c => {
        const role = c.role || 'unknown';
        return `- **${c.name}** (${role}): ${c.essence || c.motivation || 'No description'}`;
      }).join('\n')
    : '(No characters defined yet)';

  // Format genome
  const genomeText = formatGenome(genome);

  // Format existing beats
  const beatsContext = existingBeats && existingBeats.length > 0
    ? existingBeats.map(b => `**${b.name}:** ${b.content}`).join('\n\n')
    : '(No other beats written yet)';

  return `You are helping a novelist fill in their Save the Cat beat sheet. You need to write content for ONE specific beat.

## The Beat to Write

**Beat Name:** ${beatInfo.name}
**What this beat does:** ${beatInfo.description}
**Guiding question:** ${beatInfo.question}

## Story Context

### Original Braindump
${braindump || '(Not provided)'}

### Story Genome
${genomeText || '(Not provided)'}

### Story Concept
${storyConcept || '(Not provided)'}

### Characters
${characterList}

### Other Beats Already Written
${beatsContext}

## Your Task

Write 2-4 sentences describing what happens in the "${beatInfo.name}" beat for THIS specific story.

**Critical Instructions:**
1. Be SPECIFIC to this story - use actual character names, settings, and situations from the context above
2. Don't write generic beat advice - write what ACTUALLY HAPPENS in this story's version of the beat
3. Use character names naturally in your response
4. Stay true to the genre, tone, and themes established in the genome
5. If other beats are already written, maintain consistency with them
6. Write in present tense, as if describing what the reader will experience
7. Keep it concise - this is a beat sheet, not a full outline

**Example of BAD output (too generic):**
"The protagonist faces their lowest point and must confront their inner demons."

**Example of GOOD output (specific to a story):**
"Elena discovers Marcus has been working for the Corporation all along. She collapses in the snow outside the abandoned station, her research scattered by the Arctic wind. Everything she thought she knew was a lie."

Now write the "${beatInfo.name}" beat for this story:`;
}

function formatGenome(genome) {
  if (!genome) return '';

  const sections = [];

  if (genome.genres && genome.genres.length > 0) {
    const names = genome.genres.map(g => typeof g === 'string' ? g : g.name).filter(Boolean);
    if (names.length) sections.push(`**Genre(s):** ${names.join(', ')}`);
  }

  if (genome.archetypes && genome.archetypes.length > 0) {
    const names = genome.archetypes.map(a => typeof a === 'string' ? a : a.name).filter(Boolean);
    if (names.length) sections.push(`**Archetype(s):** ${names.join(', ')}`);
  }

  if (genome.themes && genome.themes.length > 0) {
    const names = genome.themes.map(t => typeof t === 'string' ? t : t.name).filter(Boolean);
    if (names.length) sections.push(`**Theme(s):** ${names.join(', ')}`);
  }

  if (genome.tones && genome.tones.length > 0) {
    const names = genome.tones.map(t => typeof t === 'string' ? t : t.name).filter(Boolean);
    if (names.length) sections.push(`**Tone(s):** ${names.join(', ')}`);
  }

  if (genome.stakes && genome.stakes.length > 0) {
    const names = genome.stakes.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
    if (names.length) sections.push(`**Stakes:** ${names.join(', ')}`);
  }

  if (genome.humorRole) {
    const name = typeof genome.humorRole === 'string' ? genome.humorRole : genome.humorRole.name;
    if (name && name !== 'none') sections.push(`**Humor Role:** ${name}`);
  }

  return sections.join('\n');
}
