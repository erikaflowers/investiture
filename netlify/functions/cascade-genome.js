// Netlify serverless function for cascading genome changes to story concept
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
    const { previousGenome, newGenome, allSections, braindump } = JSON.parse(event.body);

    if (!newGenome || !allSections || allSections.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing genome or sections' })
      };
    }

    // Build the prompt
    const prompt = buildCascadePrompt(previousGenome, newGenome, allSections, braindump);

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
      if (!Array.isArray(result.affectedSections)) {
        result.affectedSections = [];
      }
    } catch (parseError) {
      // Fallback: no changes detected
      console.log('JSON parse failed, returning no changes:', parseError.message);
      result = {
        summary: rawResponse,
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
        summary: result.summary || '',
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
        error: 'Failed to analyze genome changes',
        details: error.message
      })
    };
  }
}

function buildCascadePrompt(previousGenome, newGenome, allSections, braindump) {
  const prevGenomeText = formatGenome(previousGenome);
  const newGenomeText = formatGenome(newGenome);
  const sectionsText = allSections.map(s => `### ${s.name}\n${s.content}`).join('\n\n');

  return `You are a story development assistant helping a novelist understand how changes to their Story Genome affect their existing Story Concept.

## Previous Story Genome
${prevGenomeText || '(No previous genome)'}

## New Story Genome
${newGenomeText}

## Current Story Concept
${sectionsText}

## Original Braindump
${braindump || '(Not provided)'}

## Your Task
Analyze how the genome changes impact the existing story concept. The writer has updated their structural choices (genre, archetype, themes, tone, stakes, humor) and needs to understand what sections of their concept may need revision to stay aligned.

**Critical Instructions:**
1. Compare the previous and new genome carefully
2. For EACH section, determine if it needs adjustment based on the genome changes
3. Only flag sections that genuinely conflict with or don't reflect the new genome
4. Provide specific, actionable suggested revisions

**Response Format:**
Return ONLY valid JSON in this exact format (no markdown code blocks, no extra text):
{
  "summary": "Brief 1-2 sentence summary of the key genome changes and their impact",
  "affectedSections": [
    {
      "section": "Name of affected section",
      "reason": "Why this section needs adjustment based on the genome change",
      "suggestedFix": "The revised text for this section that aligns with the new genome"
    }
  ]
}

If no sections need adjustment (the concept already aligns with the new genome), return:
{
  "summary": "The concept already aligns well with your genome changes.",
  "affectedSections": []
}

**Guidelines:**
- Be specific about WHICH genome change affects WHICH section
- Preserve the writer's voice and original ideas
- Only suggest changes that are necessary for alignment
- Keep suggested fixes approximately the same length as originals

Return the JSON now:`;
}

function formatGenome(genome) {
  if (!genome) return '';

  const sections = [];

  if (genome.genres && genome.genres.length > 0) {
    const names = genome.genres.map(g => typeof g === 'string' ? g : g.name).join(', ');
    sections.push(`**Genre(s):** ${names}`);
  }

  if (genome.archetypes && genome.archetypes.length > 0) {
    const names = genome.archetypes.map(a => typeof a === 'string' ? a : a.name).join(', ');
    sections.push(`**Story Archetype(s):** ${names}`);
  }

  if (genome.themes && genome.themes.length > 0) {
    const names = genome.themes.map(t => typeof t === 'string' ? t : t.name).join(', ');
    sections.push(`**Theme(s):** ${names}`);
  }

  if (genome.tones && genome.tones.length > 0) {
    const names = genome.tones.map(t => typeof t === 'string' ? t : t.name).join(', ');
    sections.push(`**Tone(s):** ${names}`);
  }

  if (genome.stakes && genome.stakes.length > 0) {
    const names = genome.stakes.map(s => typeof s === 'string' ? s : s.name).join(', ');
    sections.push(`**Stakes:** ${names}`);
  }

  if (genome.humorRole && genome.humorRole !== 'none') {
    const name = typeof genome.humorRole === 'string' ? genome.humorRole : genome.humorRole.name;
    sections.push(`**Humor Role:** ${name}`);
  }

  if (genome.humorStyles && genome.humorStyles.length > 0) {
    const names = genome.humorStyles.map(h => typeof h === 'string' ? h : h.name).join(', ');
    sections.push(`**Humor Style(s):** ${names}`);
  }

  return sections.join('\n');
}
