// Netlify serverless function for refining a single section of the story concept
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
    const { sectionName, allSections, direction, genome, braindump } = JSON.parse(event.body);

    if (!sectionName || !allSections) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing section name or sections' })
      };
    }

    // Build the prompt
    const prompt = buildRefinePrompt(sectionName, allSections, direction, genome, braindump);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
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

    // Try to parse as JSON, with fallback
    let result;
    try {
      // Try to extract JSON from the response (Claude might wrap it in markdown code blocks)
      let jsonStr = rawResponse;

      // Remove markdown code blocks if present
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      result = JSON.parse(jsonStr);

      // Validate structure
      if (!result.revisedSection) {
        throw new Error('Missing revisedSection in response');
      }
      if (!Array.isArray(result.affectedSections)) {
        result.affectedSections = [];
      }
    } catch (parseError) {
      // Fallback: treat the whole response as the revised section
      console.log('JSON parse failed, using fallback:', parseError.message);
      result = {
        revisedSection: rawResponse,
        affectedSections: []
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        revisedSection: result.revisedSection,
        affectedSections: result.affectedSections,
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

function buildRefinePrompt(sectionName, allSections, direction, genome, braindump) {
  // Format the genome into readable context
  const genomeText = formatGenome(genome);

  // Format all sections for context
  const sectionsText = allSections.map(s => `### ${s.name}\n${s.content}`).join('\n\n');

  const directionText = direction
    ? `\n\n## Writer's Direction\nThe writer wants you to: ${direction}`
    : '';

  return `You are a story development assistant helping a novelist refine a specific section of their story concept.

## Full Story Concept (for context)
${sectionsText}
${directionText}

## Story DNA

### The Writer's Original Braindump:
${braindump || '(Not provided)'}

### Story Genome (structural choices):
${genomeText || '(Not provided)'}

## Your Task
Refine the "${sectionName}" section based on the writer's direction (if provided) or improve it while staying true to the story's DNA.

**Critical Instructions:**
1. Rewrite ONLY the "${sectionName}" section
2. Review ALL OTHER sections for consistency with your changes
3. If your change creates contradictions or drift with other sections, flag them

**Response Format:**
Return ONLY valid JSON in this exact format (no markdown code blocks, no extra text):
{
  "revisedSection": "the new text for ${sectionName}",
  "affectedSections": [
    {
      "section": "Name of affected section",
      "reason": "Brief explanation of the inconsistency",
      "suggestedFix": "Proposed revised text for that section"
    }
  ]
}

If no other sections are affected, return an empty array for affectedSections.

**Guidelines for the revised section:**
- Maintain the same general purpose of this section type
- Stay grounded in the braindump and genome context
- Use markdown formatting (*italics* for titles, **bold** for emphasis) as appropriate
- Keep approximately the same length unless the direction suggests otherwise

Return the JSON now:`;
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
