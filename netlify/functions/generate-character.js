// Netlify serverless function for generating characters with Claude
// Environment variable ANTHROPIC_API_KEY must be set in Netlify dashboard

import './shared/load-env.js'; // Load .env for local development
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
  console.log('[generate-character] API key check:', {
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : 'none',
    envKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC'))
  });

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' })
    };
  }

  try {
    const { braindump, genome, storyConcept, existingCharacters, role, currentCharacter, rerollField } = JSON.parse(event.body);

    if (!braindump || !storyConcept) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing braindump or storyConcept' })
      };
    }

    // Build the prompt (different for full generate vs single field reroll)
    const prompt = rerollField
      ? buildRerollPrompt(braindump, genome, storyConcept, existingCharacters, role, currentCharacter, rerollField)
      : buildPrompt(braindump, genome, storyConcept, existingCharacters, role);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: editorPersona + `\n\nIMPORTANT: When generating characters, you MUST respond with valid JSON only. No markdown, no explanation, just the JSON object.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    // Parse JSON response
    let character;
    try {
      // Handle potential markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText];
      character = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error('Failed to parse character JSON:', responseText);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to parse character response',
          details: parseError.message,
          raw: responseText
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        character,
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate character',
        details: error.message
      })
    };
  }
}

function buildPrompt(braindump, genome, storyConcept, existingCharacters, role) {
  // Format existing characters
  let existingCharsText = 'None yet.';
  if (existingCharacters && existingCharacters.length > 0) {
    existingCharsText = existingCharacters.map(c =>
      `- **${c.name}** (${c.role || 'no role'}): Want: ${c.want || 'undefined'}, Need: ${c.need || 'undefined'}`
    ).join('\n');
  }

  // Format genome
  const genomeText = genome ? formatGenome(genome) : 'Not specified.';

  // Role context
  const roleContext = role ? getRoleContext(role) : '';

  return `Generate a character for this story.

## Story Context

### Original Braindump
${braindump}

### Story Genome
${genomeText}

### Story Concept
${storyConcept}

### Existing Characters
${existingCharsText}

${roleContext}

## Your Task

Create a compelling character that:
1. Fits naturally into this story's world and tone
2. Has clear dramatic function (what they do for the plot)
3. Has internal dimension (want vs need creates tension)
4. Complements or contrasts with existing characters
5. Serves the story's themes

## Response Format

Respond with ONLY a JSON object (no markdown, no explanation):

{
  "name": "Character's full name",
  "want": "What they consciously pursue (external goal) - 1-2 sentences",
  "need": "What they must learn/become (internal growth) - 1-2 sentences",
  "arc_type": "positive-change" | "negative-change" | "steadfast",
  "arc_description": "How they change (or hold steady) through the story - 2-3 sentences",
  "connections": "Key relationships to other characters - 1-2 sentences"
}

Generate a character now:`;
}

function getRoleContext(role) {
  const roleDescriptions = {
    protagonist: `## Role: PROTAGONIST
This is the story's main character - the one whose journey we follow. They drive the plot toward the goal. Their want/need gap is the engine of the story.`,

    antagonist: `## Role: ANTAGONIST
This character opposes the protagonist's goal. They don't have to be evil - they just want something that conflicts with what the protagonist wants. Great antagonists believe they're the hero of their own story.`,

    mirror: `## Role: MIRROR
This character reflects or challenges the protagonist's worldview. They might show what the protagonist could become (good or bad), or embody the theme from a different angle. They force the protagonist to confront their beliefs.`,

    ally: `## Role: ALLY
This character supports the protagonist's journey. They provide help, faith, mentorship, or practical assistance. But they shouldn't make things too easy - good allies have their own complications.`,

    skeptic: `## Role: SKEPTIC
This character questions and doubts. They challenge the protagonist's plans, poke holes in logic, and keep everyone honest. They're not necessarily negative - they might be the voice of reason.`,

    wildcard: `## Role: WILDCARD
This character doesn't fit neatly into other roles. They might be comic relief, a love interest, a chaos agent, or something entirely unique. They add texture and unpredictability to the story.`
  };

  return roleDescriptions[role] || '';
}

function formatGenome(genome) {
  const sections = [];

  if (genome.genres && genome.genres.length > 0) {
    sections.push(`**Genres:** ${genome.genres.map(g => g.name || g).join(', ')}`);
  }

  if (genome.tones && genome.tones.length > 0) {
    sections.push(`**Tones:** ${genome.tones.map(t => t.name || t).join(', ')}`);
  }

  if (genome.themes && genome.themes.length > 0) {
    sections.push(`**Themes:** ${genome.themes.map(t => t.name || t).join(', ')}`);
  }

  if (genome.stakes && genome.stakes.length > 0) {
    sections.push(`**Stakes:** ${genome.stakes.map(s => s.name || s).join(', ')}`);
  }

  return sections.join('\n') || 'Not specified.';
}

function buildRerollPrompt(braindump, genome, storyConcept, existingCharacters, role, currentCharacter, rerollField) {
  const fieldLabels = {
    name: 'Name',
    want: 'Want (External Goal)',
    need: 'Need (Internal Growth)',
    arc_type: 'Arc Type',
    arc_description: 'Arc Description',
    connections: 'Connections'
  };

  const fieldLabel = fieldLabels[rerollField] || rerollField;
  const genomeText = genome ? formatGenome(genome) : 'Not specified.';
  const roleContext = role ? getRoleContext(role) : '';

  // Format current character values
  const currentValues = Object.entries(currentCharacter)
    .filter(([key, val]) => val && key !== rerollField)
    .map(([key, val]) => `- **${fieldLabels[key] || key}:** ${val}`)
    .join('\n');

  return `Regenerate ONLY the "${fieldLabel}" field for this character.

## Story Context

### Story Genome
${genomeText}

### Story Concept (excerpt)
${storyConcept.substring(0, 1000)}${storyConcept.length > 1000 ? '...' : ''}

${roleContext}

## Current Character (keep these consistent)
${currentValues || 'No other fields set yet.'}

## Your Task

Generate a NEW, DIFFERENT value for the "${fieldLabel}" field that:
1. Is consistent with the other character details above
2. Fits the story's tone and genre
3. Is meaningfully different from any previous value
${rerollField === 'arc_type' ? '4. Must be one of: "positive-change", "negative-change", or "steadfast"' : ''}

## Response Format

Respond with ONLY a JSON object containing ALL fields (keep existing values, change only ${rerollField}):

{
  "name": "${currentCharacter.name || ''}",
  "want": "${rerollField === 'want' ? 'NEW VALUE HERE' : (currentCharacter.want || '')}",
  "need": "${rerollField === 'need' ? 'NEW VALUE HERE' : (currentCharacter.need || '')}",
  "arc_type": "${rerollField === 'arc_type' ? 'NEW VALUE HERE' : (currentCharacter.arc_type || '')}",
  "arc_description": "${rerollField === 'arc_description' ? 'NEW VALUE HERE' : (currentCharacter.arc_description || '')}",
  "connections": "${rerollField === 'connections' ? 'NEW VALUE HERE' : (currentCharacter.connections || '')}"
}

Generate now:`;
}
