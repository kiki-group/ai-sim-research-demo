import { Type } from "@google/genai";

/** recruiter chat turn */
export const recruiterTurnSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description:
        "Short conversational message from the assistant to display to the user.",
    },
    ready: {
      type: Type.BOOLEAN,
      description:
        "True when we have enough info to generate archetypes (after <= 4 questions).",
    },
    spec: {
      type: Type.OBJECT,
      description: "Only present when ready=true.",
      properties: {
        headline: { type: Type.STRING },
        description: { type: Type.STRING },
        demographics: { type: Type.STRING },
        behaviors: { type: Type.STRING },
        context: { type: Type.STRING },
        goals: { type: Type.STRING },
        bias_notes: { type: Type.STRING },
      },
      propertyOrdering: [
        "headline",
        "description",
        "demographics",
        "behaviors",
        "context",
        "goals",
        "bias_notes",
      ],
    },
  },
  required: ["message", "ready"],
  propertyOrdering: ["message", "ready", "spec"],
};

const oceanSchema = {
  type: Type.OBJECT,
  properties: {
    openness: { type: Type.NUMBER },
    conscientiousness: { type: Type.NUMBER },
    extraversion: { type: Type.NUMBER },
    agreeableness: { type: Type.NUMBER },
    neuroticism: { type: Type.NUMBER },
  },
  required: [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ],
};

export const archetypesSchema = {
  type: Type.OBJECT,
  properties: {
    archetypes: {
      type: Type.ARRAY,
      // Target 12 archetypes; enforced via prompt + client-side truncation.
      // Strict min/max is too brittle across Gemini model versions.
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          age: { type: Type.INTEGER },
          city: { type: Type.STRING },
          country: { type: Type.STRING },
          occupation: { type: Type.STRING },
          income_band: { type: Type.STRING },
          education: { type: Type.STRING },
          tech_savviness: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
          },
          ocean: oceanSchema,
          goals: { type: Type.ARRAY, items: { type: Type.STRING } },
          pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          quirks: { type: Type.ARRAY, items: { type: Type.STRING } },
          bias_notes: { type: Type.STRING },
          summary: { type: Type.STRING },
        },
        required: [
          "name",
          "age",
          "city",
          "country",
          "occupation",
          "income_band",
          "education",
          "tech_savviness",
          "ocean",
          "goals",
          "pain_points",
          "quirks",
          "bias_notes",
          "summary",
        ],
      },
    },
  },
  required: ["archetypes"],
};

export const reportSchema = {
  type: Type.OBJECT,
  properties: {
    executive_summary: { type: Type.STRING },
    themes: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 8,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
          sentiment: {
            type: Type.STRING,
            enum: ["positive", "neutral", "negative", "mixed"],
          },
          archetype_coverage: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          representative_quotes: {
            type: Type.ARRAY,
            minItems: 2,
            maxItems: 4,
            items: {
              type: Type.OBJECT,
              properties: {
                personaName: { type: Type.STRING },
                archetypeId: { type: Type.STRING },
                quote: { type: Type.STRING },
              },
              required: ["personaName", "archetypeId", "quote"],
            },
          },
        },
        required: [
          "title",
          "description",
          "percentage",
          "sentiment",
          "archetype_coverage",
          "representative_quotes",
        ],
      },
    },
    surprises: { type: Type.ARRAY, items: { type: Type.STRING } },
    follow_up_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["executive_summary", "themes", "surprises", "follow_up_questions"],
};

export const voiceAgentSchema = {
  type: Type.OBJECT,
  properties: {
    transcripts: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 5,
      items: {
        type: Type.OBJECT,
        properties: {
          personaName: { type: Type.STRING },
          archetypeId: { type: Type.STRING },
          outcome: {
            type: Type.STRING,
            enum: ["successful", "partial", "failed", "abandoned"],
          },
          emotional_arc: { type: Type.STRING },
          turns: {
            type: Type.ARRAY,
            minItems: 4,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING, enum: ["agent", "caller"] },
                text: { type: Type.STRING },
              },
              required: ["speaker", "text"],
            },
          },
          notes: { type: Type.STRING },
        },
        required: [
          "personaName",
          "archetypeId",
          "outcome",
          "emotional_arc",
          "turns",
          "notes",
        ],
      },
    },
    friction_points: { type: Type.ARRAY, items: { type: Type.STRING } },
    wins: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_prompt_tweaks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    success_rate: { type: Type.NUMBER },
  },
  required: [
    "transcripts",
    "friction_points",
    "wins",
    "recommended_prompt_tweaks",
    "success_rate",
  ],
};

export const usabilitySchema = {
  type: Type.OBJECT,
  properties: {
    task_success_rate: { type: Type.NUMBER },
    avg_time_to_task_seconds: { type: Type.NUMBER },
    per_persona: {
      type: Type.ARRAY,
      minItems: 4,
      maxItems: 8,
      items: {
        type: Type.OBJECT,
        properties: {
          personaName: { type: Type.STRING },
          archetypeId: { type: Type.STRING },
          completed: { type: Type.BOOLEAN },
          time_seconds: { type: Type.NUMBER },
          frustration: { type: Type.NUMBER },
          walkthrough: { type: Type.STRING },
          quote: { type: Type.STRING },
        },
        required: [
          "personaName",
          "archetypeId",
          "completed",
          "time_seconds",
          "frustration",
          "walkthrough",
          "quote",
        ],
      },
    },
    friction_points: { type: Type.ARRAY, items: { type: Type.STRING } },
    wins: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_changes: { type: Type.ARRAY, items: { type: Type.STRING } },
    heatmap_hotspots: {
      type: Type.ARRAY,
      minItems: 4,
      maxItems: 10,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          intensity: { type: Type.NUMBER },
          kind: {
            type: Type.STRING,
            enum: ["love", "confusion", "abandon", "hover"],
          },
        },
        required: ["label", "x", "y", "intensity", "kind"],
      },
    },
  },
  required: [
    "task_success_rate",
    "avg_time_to_task_seconds",
    "per_persona",
    "friction_points",
    "wins",
    "recommended_changes",
    "heatmap_hotspots",
  ],
};

export const conceptSchema = {
  type: Type.OBJECT,
  properties: {
    love_pct: { type: Type.NUMBER },
    neutral_pct: { type: Type.NUMBER },
    hate_pct: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    reasons_to_love: { type: Type.ARRAY, items: { type: Type.STRING } },
    reasons_to_reject: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggested_rewrites: { type: Type.ARRAY, items: { type: Type.STRING } },
    quotes: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 6,
      items: {
        type: Type.OBJECT,
        properties: {
          personaName: { type: Type.STRING },
          archetypeId: { type: Type.STRING },
          sentiment: {
            type: Type.STRING,
            enum: ["love", "neutral", "hate"],
          },
          quote: { type: Type.STRING },
        },
        required: ["personaName", "archetypeId", "sentiment", "quote"],
      },
    },
  },
  required: [
    "love_pct",
    "neutral_pct",
    "hate_pct",
    "summary",
    "reasons_to_love",
    "reasons_to_reject",
    "suggested_rewrites",
    "quotes",
  ],
};

export const abTestSchema = {
  type: Type.OBJECT,
  properties: {
    winner: { type: Type.STRING, enum: ["A", "B", "tie"] },
    summary: { type: Type.STRING },
    option_a_pct: { type: Type.NUMBER },
    option_b_pct: { type: Type.NUMBER },
    undecided_pct: { type: Type.NUMBER },
    per_archetype: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          archetypeId: { type: Type.STRING },
          archetypeName: { type: Type.STRING },
          prefers: { type: Type.STRING, enum: ["A", "B", "tie"] },
          rationale: { type: Type.STRING },
        },
        required: ["archetypeId", "archetypeName", "prefers", "rationale"],
      },
    },
    key_reasons_a: { type: Type.ARRAY, items: { type: Type.STRING } },
    key_reasons_b: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "winner",
    "summary",
    "option_a_pct",
    "option_b_pct",
    "undecided_pct",
    "per_archetype",
    "key_reasons_a",
    "key_reasons_b",
  ],
};

export const surveySchema = {
  type: Type.OBJECT,
  properties: {
    executive_summary: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          kind: {
            type: Type.STRING,
            enum: ["multiple_choice", "likert"],
          },
          distribution: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                percentage: { type: Type.NUMBER },
                rationale_quote: { type: Type.STRING },
              },
              required: ["label", "percentage", "rationale_quote"],
            },
          },
        },
        required: ["question", "kind", "distribution"],
      },
    },
  },
  required: ["executive_summary", "questions"],
};

export const pricingSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    too_cheap: { type: Type.NUMBER },
    bargain: { type: Type.NUMBER },
    getting_expensive: { type: Type.NUMBER },
    too_expensive: { type: Type.NUMBER },
    sweet_spot_band: { type: Type.STRING },
    curve: {
      type: Type.ARRAY,
      minItems: 5,
      items: {
        type: Type.OBJECT,
        properties: {
          price: { type: Type.NUMBER },
          too_cheap_pct: { type: Type.NUMBER },
          bargain_pct: { type: Type.NUMBER },
          expensive_pct: { type: Type.NUMBER },
          too_expensive_pct: { type: Type.NUMBER },
        },
        required: [
          "price",
          "too_cheap_pct",
          "bargain_pct",
          "expensive_pct",
          "too_expensive_pct",
        ],
      },
    },
    segment_commentary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          archetypeId: { type: Type.STRING },
          archetypeName: { type: Type.STRING },
          willingness_to_pay: { type: Type.NUMBER },
          quote: { type: Type.STRING },
        },
        required: [
          "archetypeId",
          "archetypeName",
          "willingness_to_pay",
          "quote",
        ],
      },
    },
  },
  required: [
    "summary",
    "too_cheap",
    "bargain",
    "getting_expensive",
    "too_expensive",
    "sweet_spot_band",
    "curve",
    "segment_commentary",
  ],
};
