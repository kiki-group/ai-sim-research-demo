import type { Archetype, Persona } from "./types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const FIRST_NAMES_F = [
  "Ava",
  "Maya",
  "Priya",
  "Zoe",
  "Chloe",
  "Aisha",
  "Sofia",
  "Naomi",
  "Leah",
  "Jules",
  "Sana",
  "Ines",
  "Keira",
  "Luna",
  "Yumi",
  "Talia",
  "Isla",
  "Noor",
  "Sasha",
  "Amara",
];
const FIRST_NAMES_M = [
  "Noah",
  "Kai",
  "Dev",
  "Eli",
  "Arjun",
  "Mateo",
  "Ryo",
  "Theo",
  "Jonah",
  "Omar",
  "Lucas",
  "Kenji",
  "Ben",
  "Nikhil",
  "Caleb",
  "Luca",
  "Eitan",
  "Malik",
  "Ravi",
  "Asher",
];
const FIRST_NAMES_NB = ["Sam", "Alex", "Rio", "Skye", "Rowan", "Jae", "Quinn", "River", "Adrian", "Nico"];
const LAST_NAMES = [
  "Patel",
  "Nguyen",
  "Kim",
  "Garcia",
  "Silva",
  "Okafor",
  "Chen",
  "Haddad",
  "Cohen",
  "Rivera",
  "Okonkwo",
  "Tanaka",
  "Novak",
  "Moreau",
  "Ibrahim",
  "Park",
  "Rossi",
  "Dubois",
  "Schneider",
  "Singh",
  "Lopez",
  "O'Connor",
  "Reyes",
  "Murphy",
  "Andersen",
];
const CITIES: Record<string, string[]> = {
  "United States": ["Austin", "Brooklyn", "Seattle", "Denver", "Atlanta", "Oakland", "Chicago", "Phoenix"],
  "United Kingdom": ["Manchester", "Bristol", "Leeds", "Glasgow", "London"],
  India: ["Bengaluru", "Pune", "Mumbai", "Hyderabad", "Chennai"],
  Germany: ["Berlin", "Munich", "Hamburg", "Leipzig"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Curitiba"],
  Japan: ["Tokyo", "Osaka", "Fukuoka"],
  France: ["Paris", "Lyon", "Nantes"],
  Canada: ["Toronto", "Vancouver", "Montreal"],
  Nigeria: ["Lagos", "Abuja"],
  Mexico: ["Mexico City", "Monterrey", "Guadalajara"],
  Australia: ["Melbourne", "Sydney", "Brisbane"],
  Remote: ["Remote - Americas", "Remote - EU", "Remote - APAC"],
};

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function ensureUnique(base: string, used: Set<string>): string {
  let candidate = base;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base} ${n}`;
    n++;
  }
  used.add(candidate);
  return candidate;
}

export function archetypeWithId(raw: Omit<Archetype, "id">, i: number): Archetype {
  const id = `A${String(i + 1).padStart(2, "0")}`;
  return { id, ...raw };
}

function jitter(n: number, rand: () => number, range = 15) {
  const delta = Math.round((rand() * 2 - 1) * range);
  return Math.max(0, Math.min(100, n + delta));
}

/**
 * Expand 12 archetypes into exactly 100 distinct-feeling personas.
 * ~8 clones per archetype, with 4 "edge" personas drawn from the mixed pool.
 */
export function expandArchetypesToPersonas(
  archetypes: Archetype[],
  seedBase: string
): Persona[] {
  const personas: Persona[] = [];
  const usedNames = new Set<string>();
  const perArchetypeCounts = new Array(archetypes.length).fill(8);
  // distribute remaining 100 - 8*12 = 4 across first 4 archetypes
  const remaining = 100 - 8 * archetypes.length;
  for (let i = 0; i < remaining; i++) perArchetypeCounts[i % archetypes.length] += 1;
  if (remaining < 0) {
    for (let i = 0; i < -remaining; i++) perArchetypeCounts[i] -= 1;
  }

  archetypes.forEach((a, ai) => {
    const count = perArchetypeCounts[ai];
    const countries = Object.keys(CITIES);
    for (let i = 0; i < count; i++) {
      const rand = mulberry32(hashString(`${seedBase}:${a.id}:${i}`));
      const genderPool =
        rand() < 0.5 ? FIRST_NAMES_F : rand() < 0.85 ? FIRST_NAMES_M : FIRST_NAMES_NB;
      const first = pick(genderPool, rand);
      const last = pick(LAST_NAMES, rand);
      const baseName = `${first} ${last}`;
      const name = ensureUnique(baseName, usedNames);

      // age jitter within archetype
      const age = Math.max(
        16,
        Math.min(85, a.age + Math.round((rand() * 2 - 1) * 5))
      );

      // keep mostly to the archetype's country, occasionally vary
      let country = a.country;
      let city = a.city;
      if (rand() < 0.25) {
        country = pick(countries, rand);
        city = pick(CITIES[country], rand);
      } else if (CITIES[a.country]) {
        city = pick(CITIES[a.country], rand);
      }

      const quirk = pick(a.quirks.length ? a.quirks : ["keeps a handwritten list"], rand);
      const goal = pick(a.goals.length ? a.goals : ["get more done with less hassle"], rand);
      const pain_point = pick(
        a.pain_points.length ? a.pain_points : ["too many tools"],
        rand
      );

      personas.push({
        id: `${a.id}-${String(i + 1).padStart(2, "0")}`,
        archetypeId: a.id,
        name,
        age,
        city,
        country,
        occupation: a.occupation,
        tech_savviness: a.tech_savviness,
        ocean: {
          openness: jitter(a.ocean.openness, rand),
          conscientiousness: jitter(a.ocean.conscientiousness, rand),
          extraversion: jitter(a.ocean.extraversion, rand),
          agreeableness: jitter(a.ocean.agreeableness, rand),
          neuroticism: jitter(a.ocean.neuroticism, rand),
        },
        quirk,
        goal,
        pain_point,
      });
    }
  });

  // Shuffle deterministically so the grid feels heterogeneous.
  const shuffleRand = mulberry32(hashString(`${seedBase}:shuffle`));
  for (let i = personas.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRand() * (i + 1));
    [personas[i], personas[j]] = [personas[j], personas[i]];
  }

  return personas.slice(0, 100);
}

export function personaInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

// Soft, professional pastel backgrounds with matching on-color text.
const AVATAR_PALETTE: { bg: string; text: string }[] = [
  { bg: "#e0e7ff", text: "#4338ca" }, // indigo
  { bg: "#ccfbf1", text: "#0f766e" }, // teal
  { bg: "#fce7f3", text: "#be185d" }, // pink
  { bg: "#fef3c7", text: "#a16207" }, // amber
  { bg: "#dcfce7", text: "#15803d" }, // green
  { bg: "#e0f2fe", text: "#0369a1" }, // sky
  { bg: "#ede9fe", text: "#6d28d9" }, // violet
  { bg: "#fee2e2", text: "#b91c1c" }, // red
  { bg: "#f1f5f9", text: "#334155" }, // slate
  { bg: "#ffedd5", text: "#c2410c" }, // orange
  { bg: "#e2e8f0", text: "#1e293b" }, // slate-dark
  { bg: "#fae8ff", text: "#a21caf" }, // fuchsia
];

export function avatarGradient(seed: string): { bg: string; text: string } {
  const h = hashString(seed);
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
