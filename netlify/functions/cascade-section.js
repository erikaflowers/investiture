// Netlify serverless function for checking downstream impacts of section edits
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
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' })
    };
  }

  try {
    const { editedSection, previousContent, newContent, allSections, genome, braindump } = JSON.parse(event.body);

    if (!editedSection || !allSections) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing edited section or sections' })
      };
    }

    // Build the prompt
    const prompt = buildCascadePrompt(editedSection, previousContent, newContent, allSections, genome, braindump);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: editorPersona + `\n\nIMPORTANT: You MUST respond with valid JSON only. No markdown, no explanation, just the JSON object.`,
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

    // Parse JSON response
    let result;
    try {
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.log('JSON parse failed:', parseError.message);
      result = { hasImpact: false, affectedSections: [] };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        hasImpact: result.hasImpact || (result.affectedSections && result.affectedSections.length > 0),
        affectedSections: result.affectedSections || [],
        summary: result.summary || '',
        model: message.model,
        usage: message.usage
      })
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to check section cascade',
        details: error.message
      })
    };
  }
}

function buildCascadePrompt(editedSection, previousContent, newContent, allSections, genome, braindump) {
  const genomeText = formatGenome(genome);

  // Format other sections (excluding the edited one)
  const otherSections = allSections
    .filter(s => s.name !== editedSection)
    .map(s => `### ${s.name}\n${s.content}`)
    .join('\n\n');

  return `You are a story consistency analyst. A writer has manually edited a section of their story concept. Your job is to check if this edit creates any inconsistencies with other sections.

## The Edit Made

**Section:** ${editedSection}

**Previous Content:**
${previousContent || '(empty)'}

**New Content:**
${newContent}

## Other Sections (check these for inconsistencies)
${otherSections || '(no other sections)'}

## Story Context

**Original Braindump:**
${braindump || '(not provided)'}

**Story Genome:**
${genomeText || '(not provided)'}

## Your Task

Analyze whether the edit to "${editedSection}" creates any inconsistencies, contradictions, or drift with the other sections.

**Response Format:**
Return ONLY valid JSON:
{
  "hasImpact": true/false,
  "summary": "Brief 1-sentence summary of the impact (or 'No inconsistencies detected')",
  "affectedSections": [
    {
      "section": "Name of affected section",
      "reason": "Brief explanation of the inconsistency",
      "suggestedFix": "Proposed revised text for that section"
    }
  ]
}

If no sections are affected, return hasImpact: false and an empty affectedSections array.

**Be conservative:** Only flag genuine inconsistencies that would confuse a reader. Minor differences in emphasis or style are fine.

Return the JSON now:`;
}

function formatGenome(genome) {
  if (!genome) return '';

  const sections = [];

  if (genome.genres && genome.genres.length > 0) {
    sections.push(`**Genre(s):** ${Array.isArray(genome.genres) ? genome.genres.map(g => g.name || g).join(', ') : genome.genres}`);
  }

  if (genome.archetypes && genome.archetypes.length > 0) {
    sections.push(`**Story Archetype(s):** ${Array.isArray(genome.archetypes) ? genome.archetypes.map(a => a.name || a).join(', ') : genome.archetypes}`);
  }

  if (genome.themes && genome.themes.length > 0) {
    sections.push(`**Theme(s):** ${Array.isArray(genome.themes) ? genome.themes.map(t => t.name || t).join(', ') : genome.themes}`);
  }

  if (genome.tones && genome.tones.length > 0) {
    sections.push(`**Tone(s):** ${Array.isArray(genome.tones) ? genome.tones.map(t => t.name || t).join(', ') : genome.tones}`);
  }

  if (genome.stakes && genome.stakes.length > 0) {
    sections.push(`**Stakes:** ${Array.isArray(genome.stakes) ? genome.stakes.map(s => s.name || s).join(', ') : genome.stakes}`);
  }

  return sections.join('\n');
}
