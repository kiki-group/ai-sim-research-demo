import type { Archetype, ChatMsg, GroupSpec } from "./types";

export const RECRUITER_SYSTEM = `You are a senior user-research recruiter helping the user define a target audience for a synthetic user study. Your job is to converge on a crisp audience spec in AT MOST 4 short questions (fewer is better).

Behavior:
- Start with a warm, concise acknowledgement of what the user said, then ask ONE focused question at a time.
- Prefer questions that unlock real texture: behaviors in context, motivations, constraints, tools, attitudes. Avoid generic demographic bingo.
- Keep messages short (1-3 sentences). No lists unless strictly necessary.
- When you have enough to produce a rich synthetic cohort, set "ready": true and populate "spec". Fill spec fields with full paragraphs that capture what you learned, including nuance and any biases to watch for.
- NEVER include code fences. Always respond with JSON that matches the provided schema.
- If the user explicitly says "just go" / "enough questions" / similar, immediately mark ready=true and fill the spec from what you have, making reasonable inferences.`;

export const ARCHETYPE_SYSTEM = `You are a lead qualitative researcher designing a diverse synthetic cohort. Given an audience spec, produce exactly 12 distinct archetypes that together span the meaningful variation in the audience. They should feel like real, specific people, not stereotypes. Include "edge" personas that will likely dissent. Do not duplicate names. OCEAN values are 0-100. Output strictly matches the provided JSON schema.`;

export const INTERVIEWER_SYSTEM = `You simulate a qualitative research analyst summarizing findings from a cohort of synthetic participants. Given 12 archetypes and a question, produce a themed insight report that:
- Groups real attitudinal / behavioral variation into 3-8 themes (not binary yes/no).
- Attributes 2-4 verbatim-style quotes per theme to specific personas, with the archetypeId that quote comes from.
- Assigns each theme a percentage (the share of the cohort holding the theme). Percentages across themes may overlap if a persona holds multiple views; aim for the primary theme per persona to sum near 100%.
- Notes surprises and suggests good follow-up questions.
- Writes with specific, human texture - avoid generic consultant-speak. Quotes should sound like how that specific persona talks, including small grammatical quirks, slang, hedges, or profession-specific language.`;

export const VOICE_AGENT_SYSTEM = `You simulate user-research results for testing a voice agent. Given a voice agent description and 12 archetypes, produce 3-5 simulated call transcripts from distinct personas. Each transcript should be 6-14 turns, capture how THAT specific persona would react (confusion, impatience, delight, etc.), and include a plausible outcome. Then aggregate friction points, wins, and prompt-engineering recommendations. Quotes must sound spoken (fillers, trail-offs, interjections), not written.`;

export const USABILITY_SYSTEM = `You simulate website usability study results. Given a site URL (you cannot actually browse it, so make reasonable inferences from the URL, product name, and the user's task description), produce per-persona walkthroughs that feel like a real UX session: where they got stuck, what they misread, and whether they completed. Also produce 4-10 heatmap hotspots with x/y coordinates normalized 0-1 (x across page width, y down page height, 0,0 is top-left). Kind "love" = delight, "confusion" = misread/confused, "abandon" = exit point, "hover" = hesitation. Intensity 0-1. Be specific and concrete.`;

export const CONCEPT_SYSTEM = `You simulate a concept / messaging test. Given the concept (copy or description) and 12 archetypes, project how the full cohort of 100 personas would split across love / neutral / hate (must sum to ~100). Provide specific, non-generic reasons and 3-6 verbatim quotes attributed to specific personas & archetypeIds. Suggested rewrites should be concrete.`;

export const AB_SYSTEM = `You simulate an A/B concept test. Given option A and option B, project preferences across 12 archetypes and aggregate to cohort-level percentages summing to 100 across A, B, undecided. Per-archetype rationale should feel like an interview quote in second-person reporting.`;

export const SURVEY_SYSTEM = `You simulate a structured survey. For each question provided, synthesize a realistic distribution across the answer options with % (summing to ~100). For each option, include a one-sentence rationale quote from a plausible respondent. Make distributions look like real human surveys - messy, non-uniform, occasionally surprising.`;

export const PRICING_SYSTEM = `You simulate a Van Westendorp pricing study. Given a product description, target audience, and candidate price points, produce:
- % saying each price is too_cheap / bargain / getting_expensive / too_expensive at the price point most likely to be the sweet spot
- a curve across 5+ prices (ascending) with the four Van Westendorp intentions at each point
- a named sweet_spot band (e.g. "$18-$24")
- per-archetype willingness_to_pay and a short quote.
Be internally consistent: as price rises, too_expensive rises, too_cheap falls, etc.`;

export function buildRecruiterPrompt(
  initialDescription: string,
  history: ChatMsg[]
) {
  const convo = history
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n");
  return `Initial user description of their target audience:
"""
${initialDescription}
"""

Conversation so far:
${convo || "(no messages yet - this is your first reply)"}

Return JSON per the schema. Remember: at most 4 questions total; fewer is better. Mark ready=true as soon as you have enough.`;
}

export function buildArchetypePrompt(spec: GroupSpec) {
  return `Audience spec:
Headline: ${spec.headline}
Description: ${spec.description}
Demographics: ${spec.demographics}
Behaviors: ${spec.behaviors}
Context: ${spec.context}
Goals: ${spec.goals}
Bias notes: ${spec.bias_notes}

Generate exactly 12 diverse archetypes per the schema.`;
}

export function formatArchetypesForPrompt(archetypes: Archetype[]) {
  return archetypes
    .map(
      (a, i) =>
        `#${i + 1} [archetypeId=${a.id}] ${a.name}, ${a.age}, ${a.city}, ${a.occupation}
  OCEAN O${a.ocean.openness} C${a.ocean.conscientiousness} E${a.ocean.extraversion} A${a.ocean.agreeableness} N${a.ocean.neuroticism}
  Tech: ${a.tech_savviness}. Goals: ${a.goals.join("; ")}
  Pain: ${a.pain_points.join("; ")}
  Quirks: ${a.quirks.join("; ")}
  Bias notes: ${a.bias_notes}
  Summary: ${a.summary}`
    )
    .join("\n\n");
}

export function buildAskPrompt(
  archetypes: Archetype[],
  question: string,
  mode: string
) {
  return `Cohort of 12 archetypes (these each represent ~8 of the full 100-persona cohort):

${formatArchetypesForPrompt(archetypes)}

Research question (${mode}):
"""
${question}
"""

Produce a themed insight report per the schema. Aim for 4-6 themes that capture real variation - NOT a binary yes/no. Each theme should include 2-4 verbatim-style quotes attributed to specific personas by name with the correct archetypeId.`;
}

export function buildVoiceAgentPrompt(
  archetypes: Archetype[],
  agentName: string,
  agentPurpose: string,
  agentOpening: string,
  agentScript: string
) {
  return `Voice agent under test:
Name: ${agentName}
Purpose: ${agentPurpose}
Opening line: "${agentOpening}"
Behavior / script notes: ${agentScript || "(none provided)"}

Cohort archetypes:
${formatArchetypesForPrompt(archetypes)}

Simulate 3-5 call transcripts from distinct personas and aggregate per the schema.`;
}

export function buildUsabilityPrompt(
  archetypes: Archetype[],
  url: string,
  task: string,
  pageDescription: string
) {
  return `Site under test:
URL: ${url}
Task the persona is trying to complete: ${task}
Page description (what the user thinks this page / site is): ${pageDescription || "(not provided - infer from URL)"}

Cohort archetypes:
${formatArchetypesForPrompt(archetypes)}

Produce a usability report per the schema.`;
}

export function buildConceptPrompt(
  archetypes: Archetype[],
  concept: string,
  audienceContext: string
) {
  return `Concept / messaging under test:
"""
${concept}
"""

Additional context: ${audienceContext || "(none)"}

Cohort archetypes:
${formatArchetypesForPrompt(archetypes)}

Produce a concept test report per the schema. love_pct + neutral_pct + hate_pct must sum to ~100.`;
}

export function buildABPrompt(
  archetypes: Archetype[],
  optionA: string,
  optionB: string,
  contextNotes: string
) {
  return `A/B test:
Option A:
"""
${optionA}
"""
Option B:
"""
${optionB}
"""

Context: ${contextNotes || "(none)"}

Cohort archetypes:
${formatArchetypesForPrompt(archetypes)}

Produce an A/B report per the schema. option_a_pct + option_b_pct + undecided_pct must sum to ~100. Include one row per archetype in per_archetype using the exact archetypeId.`;
}

export function buildSurveyPrompt(
  archetypes: Archetype[],
  questions: { q: string; kind: "multiple_choice" | "likert"; options: string[] }[]
) {
  const qs = questions
    .map(
      (q, i) =>
        `Q${i + 1} [${q.kind}]: ${q.q}\nOptions: ${q.options
          .map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`)
          .join(" | ")}`
    )
    .join("\n\n");
  return `Cohort archetypes:
${formatArchetypesForPrompt(archetypes)}

Survey:
${qs}

For each question, return a realistic distribution across its options (percentages summing to ~100) with a short rationale quote per option.`;
}

export function buildPricingPrompt(
  archetypes: Archetype[],
  product: string,
  pricePoints: number[],
  currency: string
) {
  return `Product / service under test:
"""
${product}
"""

Currency: ${currency}
Candidate price points: ${pricePoints.join(", ")}

Cohort archetypes:
${formatArchetypesForPrompt(archetypes)}

Produce a Van Westendorp pricing analysis per the schema. Make sure curve is monotonic-ish (as price rises, too_expensive rises, too_cheap falls). Include per-archetype willingness to pay.`;
}
