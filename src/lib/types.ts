export type Ocean = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type Archetype = {
  id: string;
  name: string;
  age: number;
  city: string;
  country: string;
  occupation: string;
  income_band: string;
  education: string;
  tech_savviness: "low" | "medium" | "high";
  ocean: Ocean;
  goals: string[];
  pain_points: string[];
  quirks: string[];
  bias_notes: string;
  summary: string;
};

export type Persona = {
  id: string;
  archetypeId: string;
  name: string;
  age: number;
  city: string;
  country: string;
  occupation: string;
  tech_savviness: "low" | "medium" | "high";
  ocean: Ocean;
  quirk: string;
  goal: string;
  pain_point: string;
};

export type GroupSpec = {
  headline: string;
  description: string;
  demographics: string;
  behaviors: string;
  context: string;
  goals: string;
  bias_notes: string;
};

export type Group = {
  id: string;
  name: string;
  createdAt: number;
  spec: GroupSpec;
  archetypes: Archetype[];
  personas: Persona[];
};

export type ChatMsg = {
  role: "user" | "assistant";
  content: string;
};

export type ReportTheme = {
  title: string;
  description: string;
  percentage: number;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  archetype_coverage: string[];
  representative_quotes: { personaName: string; archetypeId: string; quote: string }[];
};

export type Report = {
  id: string;
  groupId: string;
  createdAt: number;
  question: string;
  mode: "open" | "multiple_choice" | "likert";
  executive_summary: string;
  themes: ReportTheme[];
  surprises: string[];
  follow_up_questions: string[];
};

export type ActionKind =
  | "voice-agent"
  | "usability"
  | "concept"
  | "ab-test"
  | "survey"
  | "pricing";

export type ActionRun = {
  id: string;
  kind: ActionKind;
  groupId: string;
  createdAt: number;
  input: Record<string, unknown>;
  output: any;
};
