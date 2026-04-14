import { useState } from "react";
import VectorMode from "../modes/VectorMode.jsx";

const SAMPLES = {
  "Interview Notes": `USER INTERVIEW — Sarah Chen, Product Manager at a Series B SaaS company
Date: Feb 12, 2026 | Interviewer: Marcus

She's been trying to get her dev team to actually READ the research docs.
"I spend two weeks synthesizing interview data into a beautiful Notion doc,
and then the engineers just ask me the same questions in standup."

Key frustrations:
- Research dies in Confluence/Notion. Nobody reads the 40-page synthesis.
- By the time specs reach engineering, the WHY is gone. Just feature tickets.
- "We do journey mapping workshops and they're great in the room, but
  nothing from the whiteboard makes it into Jira stories."
- Design handoffs lose intent. Figma files have pixels but not PURPOSE.

She mentioned trying to use AI to summarize her research but "it just
gives me back what I put in, in bullet points. That's not synthesis."

What she wants: "I want the engineers to feel the customer's pain without
sitting through 6 hours of interview recordings."

OBSERVATION: She teared up slightly when talking about a feature that shipped
without the accessibility considerations she'd documented. "It was all in
the research. They just... didn't see it."

───

INTERVIEW 2 — Dev lead, James Torres
"I don't ignore the research on purpose. There's just no bridge between
'customer insight' and 'what I type into my IDE.' Give me structured data
I can actually consume programmatically and I'll use it every sprint."

He showed me his setup: terminal, IDE, GitHub. "If it's not in the repo,
it doesn't exist in my workflow. Period."

───

INTERVIEW 3 — Junior designer, Priya Nair
"I feel like I'm playing telephone. The PM tells me what the research said,
I design something, the dev interprets my design, and by the time it ships
it's like three generations of copy degradation."

She drew a diagram: Research → PM Summary → Design Brief → Dev Ticket → Code
"Every arrow is where we lose signal."`,

  "Workshop Stickies": `WORKSHOP OUTPUT — "Future of Our Design Process"
Facilitator: Angela | 14 participants | Feb 8, 2026
Exported from Mural board

═══ CLUSTER: PAIN POINTS ═══
- "Research never reaches code" (6 votes)
- "Handoff docs are write-only" (5 votes)
- "We redesign things we already researched" (4 votes)
- "Context switching between tools kills flow"
- "Nobody knows the customer goals except the PM"
- "Designers speak pixels, devs speak functions"
- "The spec is always out of date by sprint 2"
- "Our Jira tickets have zero user context"
- "Research insights have a half-life of 2 weeks"
- "We ship features, not outcomes"

═══ CLUSTER: WISH LIST ═══
- "Single source of truth for customer intent"
- "Research that updates automatically"
- "Devs should feel the user's pain"
- "Design decisions traced back to evidence"
- "Less meetings, more shared context"
- "AI that knows our customer as well as our PM does"
- "Version-controlled research (like code)"
- "Kill the 40-page research deck"

═══ CLUSTER: WHAT'S WORKING ═══
- "Pair design sessions are great" (3 votes)
- "When devs join interviews, magic happens"
- "Our component library saves time"
- "Async video updates > meetings"

═══ DOT VOTES: TOP PRIORITIES ═══
1. Single source of truth for customer intent (11 votes)
2. Research that reaches code automatically (9 votes)
3. Less meetings, more shared context (7 votes)
4. Design decisions traced to evidence (5 votes)

HMW: How might we make customer intent as accessible
     as a function call?`,

  "Survey Data": `SURVEY RESULTS — "Design-Dev Collaboration" (n=127)
Distributed: Jan 2026 | Response rate: 64%

Q: How often does original research inform the final shipped feature?
  Always: 4%
  Usually: 18%
  Sometimes: 41%
  Rarely: 29%
  Never: 8%

Q: Biggest barrier to using research in development?
  "Research docs are too long/unstructured" — 34%
  "No time to read them during sprint" — 28%
  "Can't find relevant research when I need it" — 21%
  "Research is outdated by the time we build" — 12%
  "Don't trust the methodology" — 5%

Q: If customer context were available as structured data
   in your repo, would you use it?
  Definitely: 52%
  Probably: 31%
  Maybe: 12%
  Probably not: 4%
  Definitely not: 1%

FREE RESPONSES (selected):
- "Just put it where I already work. I live in VS Code."
- "I would mass adopt structured customer data on day one."
- "The problem isn't that we don't do research. The
   problem is research can't survive the handoff."
- "Give me a JSON file with user needs and I'll build
   better features tomorrow. Not kidding."
- "We spent $40K on a research study last year. I found
   out about the results from a Slack thread 3 months later."
- "Every sprint retro: 'we need to be more customer-centric.'
   Every sprint: same feature factory."`,
};

SAMPLES["All Sources"] = "═══ SOURCE 1: INTERVIEW NOTES ═══\n\n" + SAMPLES["Interview Notes"] +
  "\n\n═══ SOURCE 2: WORKSHOP OUTPUT ═══\n\n" + SAMPLES["Workshop Stickies"] +
  "\n\n═══ SOURCE 3: SURVEY DATA ═══\n\n" + SAMPLES["Survey Data"];

const SYSTEM_PROMPT = `You are The Box — the Zero Vector Design transformation engine.

You receive raw, messy human-centered design research (interview notes, workshop stickies, survey data, observation notes, etc.) and you transform it into a complete three-layer output system.

## The Three Layers

**Layer 1: vector.md** — The manifest. Points to all files, describes the project context, lists sources.

**Layer 2: Data files** — Structured JSON for machines AND companion markdown for humans. These are the detailed, granular findings organized by type.

**Layer 3: Briefs** — Seven universal doctrine files that answer the irreducible core questions every design framework produces. Written in plain, narrative prose. No jargon. No schema. A new team member reads these and understands the strategic context in five minutes.

## What to Extract

From whatever raw input you receive, extract and structure:
1. **Audience** — Who we serve. Archetypes, not demographics.
2. **Needs** — What they are trying to accomplish (outcome-driven, not task-driven).
3. **Pain Points** — Where the current experience fails them.
4. **Insights** — What we learned. The "so what" from the research.
5. **Opportunities** — Where we see potential to improve. Not features yet. Solution spaces.
6. **Success Metrics** — How we will know we solved it.

## Critical Rules
- Every claim must trace back to input evidence. No hallucination. No invention.
- Use participants' exact language when possible.
- Briefs are narrative prose, not bullet lists. Written for humans who will never see the JSON.
- JSON is for machines and agents. Clean, parseable, referenced by ID.
- The summary brief is TWO PARAGRAPHS MAXIMUM. An executive who reads nothing else reads this.

## Output Format

Return a single JSON object with this exact structure:

{
  "meta": {
    "sources": number,
    "source_types": ["interview", "workshop", "survey", etc.],
    "processed_at": "ISO timestamp",
    "confidence": "high|medium|low",
    "input_characters": number
  },
  "data": {
    "personas": [
      {
        "id": "persona-001",
        "name": "string (archetype name, not real name)",
        "role": "string",
        "context": "string",
        "goals": ["string"],
        "frustrations": ["string"],
        "quote": "string (verbatim from research)"
      }
    ],
    "jtbd": [
      {
        "id": "jtbd-001",
        "job": "When [situation], I want to [motivation], so I can [outcome]",
        "priority": "critical|high|medium|low",
        "evidence": "string (source reference)"
      }
    ],
    "pain_points": [
      {
        "id": "pain-001",
        "description": "string",
        "severity": "critical|high|medium|low",
        "frequency": "string",
        "evidence": "string"
      }
    ],
    "insights": [
      {
        "id": "insight-001",
        "finding": "string",
        "implication": "string",
        "evidence": "string",
        "confidence": "high|medium|low"
      }
    ],
    "opportunities": [
      {
        "id": "opp-001",
        "description": "string",
        "addresses": ["pain-001", "jtbd-001"],
        "confidence": "high|medium|low"
      }
    ],
    "success_metrics": [
      {
        "id": "metric-001",
        "metric": "string",
        "target": "string",
        "addresses": ["opp-001"]
      }
    ]
  },
  "briefs": {
    "audience": "string — 1-3 paragraphs.",
    "needs": "string — 1-3 paragraphs.",
    "pain_points": "string — 1-3 paragraphs.",
    "insights": "string — 1-3 paragraphs.",
    "opportunities": "string — 1-3 paragraphs.",
    "success": "string — 1-2 paragraphs.",
    "summary": "string — EXACTLY TWO PARAGRAPHS."
  }
}

Output valid JSON only. No markdown wrapping. No explanation. Just the JSON object.`;

function generateVectorMd(data) {
  if (!data) return "";
  const m = data.meta || {};
  const d = data.data || {};
  let md = `# vector.md\n\n`;
  md += `> Auto-generated by The Box — Zero Vector Design\n`;
  md += `> Processed: ${m.processed_at || new Date().toISOString()}\n`;
  md += `> Sources analyzed: ${m.sources || "unknown"} (${(m.source_types || []).join(", ")})\n`;
  md += `> Confidence: ${m.confidence || "unknown"}\n`;
  md += `> Input: ${(m.input_characters || 0).toLocaleString()} characters\n`;
  md += `\n---\n\n`;
  md += `## Output Manifest\n\n`;
  md += `### Layer 1: This File\n`;
  md += `Project manifest, source metadata, and file pointers.\n\n`;
  md += `### Layer 2: Data Files (vector/)\n`;
  md += `| File | Records |\n|------|---------|\n`;
  md += `| personas.json | ${(d.personas || []).length} |\n`;
  md += `| jtbd.json | ${(d.jtbd || []).length} |\n`;
  md += `| pain-points.json | ${(d.pain_points || []).length} |\n`;
  md += `| insights.json | ${(d.insights || []).length} |\n`;
  md += `| opportunities.json | ${(d.opportunities || []).length} |\n`;
  md += `| metrics.json | ${(d.success_metrics || []).length} |\n\n`;
  md += `### Layer 3: Briefs (vector/briefs/)\n`;
  md += `audience.md · needs.md · pain-points.md · insights.md · opportunities.md · success.md · summary.md\n`;
  return md;
}

export default function BoxPage() {
  const [inputText, setInputText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [vectorMd, setVectorMd] = useState(null);
  const [activeTab, setActiveTab] = useState("vector");
  const [error, setError] = useState(null);

  const loadSample = (name) => {
    setInputText(name ? SAMPLES[name] : "");
    setResult(null);
    setVectorMd(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!inputText.trim() || processing) return;

    setProcessing(true);
    setResult(null);
    setVectorMd(null);
    setError(null);

    try {
      const response = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 8000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Transform this raw research into structured vector output:\n\n${inputText}` }],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const apiData = await response.json();
      const text = apiData.content?.[0]?.text || "";

      let parsed;
      try {
        const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Could not parse structured output");
      }

      const md = generateVectorMd(parsed);
      setResult(parsed);
      setVectorMd(md);
      setActiveTab("vector");

      await fetch("/api/write-vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vectorMd: md,
          data: parsed.data,
          briefs: parsed.briefs,
          meta: parsed.meta,
        }),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <VectorMode
      inputText={inputText}
      setInputText={setInputText}
      processing={processing}
      result={result}
      vectorMd={vectorMd}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      error={error}
      loadSample={loadSample}
      handleProcess={handleProcess}
    />
  );
}
