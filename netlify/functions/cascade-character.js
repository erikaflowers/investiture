// Netlify serverless function for analyzing character change cascades
// Handles both within-character field updates and project-wide impact

import './shared/load-env.js'; // Load .env for local development
import Anthropic from '@anthropic-ai/sdk';
import { editorPersona } from './shared/system-prompts.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' })
    };
  }

  try {
    const {
      cascadeType,  // 'within-character' or 'project-wide'
      character,
      previousCharacter,
      changedField,
      storyConcept,
      allCharacters,
      genome
    } = JSON.parse(event.body);

    let prompt;
    if (cascadeType === 'within-character') {
      prompt = buildWithinCharacterPrompt(character, previousCharacter, changedField);
    } else {
      prompt = buildProjectWidePrompt(character, previousCharacter, storyConcept, allCharacters, genome);
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: editorPersona + `\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanation.`,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim();

    let result;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText];
      result = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error('Failed to parse cascade JSON:', responseText);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to parse cascade response',
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
        cascade: result,
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Cascade analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to analyze cascade',
        details: error.message
      })
    };
  }
}

function buildWithinCharacterPrompt(character, previousCharacter, changedField) {
  const fieldLabels = {
    name: 'Name',
    want: 'Want',
    need: 'Need',
    arc_type: 'Arc Type',
    arc_description: 'Arc Description',
    connections: 'Connections'
  };

  const oldValue = previousCharacter?.[changedField] || '(empty)';
  const newValue = character[changedField] || '(empty)';

  return `A character field was just changed. Analyze if other fields need updating for consistency.

## What Changed
**Field:** ${fieldLabels[changedField] || changedField}
**Old value:** ${oldValue}
**New value:** ${newValue}

## Current Character State
- **Name:** ${character.name || '(empty)'}
- **Want:** ${character.want || '(empty)'}
- **Need:** ${character.need || '(empty)'}
- **Arc Type:** ${character.arc_type || '(empty)'}
- **Arc Description:** ${character.arc_description || '(empty)'}
- **Connections:** ${character.connections || '(empty)'}

## Your Task

Check if any OTHER fields (not the one that changed) now have inconsistencies or should be updated to reflect the change.

For example:
- If the name changed, does "connections" reference the old name?
- If want/need changed significantly, does arc_description still make sense?
- If arc_type changed, does arc_description match?

## Response Format

{
  "hasImpact": true/false,
  "affectedFields": [
    {
      "field": "field_name",
      "reason": "Why this field may need updating",
      "currentValue": "what it says now",
      "suggestedValue": "proposed new value"
    }
  ]
}

If no fields need updating, return: {"hasImpact": false, "affectedFields": []}

Analyze now:`;
}

function buildProjectWidePrompt(character, previousCharacter, storyConcept, allCharacters, genome) {
  // Format other characters (excluding the one being analyzed)
  const otherChars = (allCharacters || [])
    .filter(c => c.id !== character.id)
    .map(c => `- **${c.name}** (${c.role || 'no role'}): ${c.connections || 'no connections listed'}`)
    .join('\n') || 'No other characters yet.';

  // Summarize what changed
  let changesSummary = '';
  if (previousCharacter) {
    const changes = [];
    for (const key of ['name', 'want', 'need', 'arc_type', 'arc_description', 'connections', 'role']) {
      if (character[key] !== previousCharacter[key]) {
        changes.push(`- **${key}**: "${previousCharacter[key] || '(empty)'}" → "${character[key] || '(empty)'}"`);
      }
    }
    changesSummary = changes.length > 0 ? changes.join('\n') : 'No significant changes detected.';
  } else {
    changesSummary = 'This is a new character being added.';
  }

  return `A character was just saved. Analyze the downstream impact on the rest of the project.

## Character That Changed
**Name:** ${character.name}
**Role:** ${character.role || 'none'}
**Want:** ${character.want || '(empty)'}
**Need:** ${character.need || '(empty)'}
**Arc:** ${character.arc_type || 'none'} - ${character.arc_description || '(empty)'}
**Connections:** ${character.connections || '(empty)'}

## What Changed
${changesSummary}

## Story Concept
${storyConcept ? storyConcept.substring(0, 2000) : 'No story concept yet.'}

## Other Characters
${otherChars}

## Your Task

Analyze if any of the following need updates due to this character change:

1. **Story Concept** - Does it reference this character by name or describe them in ways that no longer match?
2. **Other Characters' Connections** - Do other characters mention this one in ways that are now inconsistent?

## Response Format

{
  "hasImpact": true/false,
  "storyConceptImpact": {
    "needsUpdate": true/false,
    "reason": "Why the concept may need updating (or null)",
    "suggestedRevisions": "Brief description of what should change (or null)"
  },
  "characterImpacts": [
    {
      "characterId": "uuid",
      "characterName": "Name",
      "field": "connections",
      "reason": "Why this needs updating",
      "currentValue": "what it says now",
      "suggestedValue": "proposed new value"
    }
  ]
}

If no impact, return: {"hasImpact": false, "storyConceptImpact": {"needsUpdate": false}, "characterImpacts": []}

Analyze now:`;
}
