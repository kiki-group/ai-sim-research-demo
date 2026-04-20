import { useMemo, useState } from "react";
import { Loader2, Play, RefreshCw, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { ActionShell } from "../components/ActionShell";
import { Field } from "../components/ResultBlocks";
import { generateStructured } from "../lib/gemini";
import { PRICING_SYSTEM, buildPricingPrompt } from "../lib/prompts";
import { pricingSchema } from "../lib/schemas";
import { useStore } from "../store/useStore";
import { uid } from "../lib/utils";

type Result = {
  summary: string;
  too_cheap: number;
  bargain: number;
  getting_expensive: number;
  too_expensive: number;
  sweet_spot_band: string;
  curve: {
    price: number;
    too_cheap_pct: number;
    bargain_pct: number;
    expensive_pct: number;
    too_expensive_pct: number;
  }[];
  segment_commentary: {
    archetypeId: string;
    archetypeName: string;
    willingness_to_pay: number;
    quote: string;
  }[];
};

export function PricingTest() {
  return (
    <ActionShell
      title="Pricing / WTP"
      subtitle="Van Westendorp-style willingness-to-pay."
    >
      {(group) => <Inner key={group.id} group={group} />}
    </ActionShell>
  );
}

function Inner({ group }: { group: any }) {
  const addRun = useStore((s) => s.addActionRun);
  const [product, setProduct] = useState(
    "Cohort Pro: synthetic user research subscription with 100-person cohorts, unlimited questions, and voice agent testing."
  );
  const [prices, setPrices] = useState("9, 19, 29, 49, 79, 129");
  const [currency, setCurrency] = useState("$ USD/mo");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    const parsed = prices
      .split(/[, ]+/)
      .map((s) => parseFloat(s.replace(/[^0-9.]/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
    if (parsed.length < 3) {
      setErr("Add at least 3 price points.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await generateStructured<Result>(
        buildPricingPrompt(group.archetypes, product, parsed, currency),
        pricingSchema,
        { system: PRICING_SYSTEM, temperature: 0.8 }
      );
      setResult(r);
      addRun({
        id: uid("ar_"),
        kind: "pricing",
        groupId: group.id,
        createdAt: Date.now(),
        input: { product, prices: parsed, currency },
        output: r,
      });
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <div className="card p-4 sm:p-5 space-y-3.5">
          <Field label="Product / service">
            <textarea
              className="textarea"
              rows={4}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </Field>
          <Field
            label="Candidate prices"
            hint="Comma-separated numbers. At least 3."
          >
            <input
              className="input"
              value={prices}
              onChange={(e) => setPrices(e.target.value)}
            />
          </Field>
          <Field label="Unit / currency">
            <input
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </Field>
          <button
            className="btn-primary-lg w-full"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Modeling prices…
              </>
            ) : (
              <>
                {result ? <RefreshCw size={16} /> : <Play size={16} />}
                {result ? "Re-run study" : "Run pricing study"}
              </>
            )}
          </button>
          {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!result ? (
          <div className="card p-8 text-center muted">
            <DollarSign size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Describe the product and candidate prices to model demand.
            </p>
          </div>
        ) : (
          <Results result={result} currency={currency} />
        )}
      </div>
    </div>
  );
}

function Results({ result, currency }: { result: Result; currency: string }) {
  const data = useMemo(
    () =>
      result.curve.map((p) => ({
        price: p.price,
        "Too cheap": Math.round(p.too_cheap_pct),
        Bargain: Math.round(p.bargain_pct),
        Expensive: Math.round(p.expensive_pct),
        "Too expensive": Math.round(p.too_expensive_pct),
      })),
    [result]
  );
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const axisColor = isDark ? "#64748b" : "#94a3b8";

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-600/15 text-brand-700 dark:text-brand-400 grid place-items-center shrink-0">
          <DollarSign size={18} />
        </div>
        <div className="flex-1">
          <p className="label">Sweet-spot band</p>
          <p className="text-lg font-semibold text-ink-900 dark:text-white">
            {result.sweet_spot_band}
          </p>
          <p className="text-sm text-ink-700 dark:text-ink-200 mt-2 leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
          Price sensitivity curves
        </p>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeOpacity={0.12} vertical={false} />
              <XAxis
                dataKey="price"
                tickFormatter={(v) => `${v}`}
                fontSize={11}
                stroke={axisColor}
              />
              <YAxis
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
                stroke={axisColor}
              />
              <Tooltip
                formatter={(v: any) => `${v}%`}
                labelFormatter={(v) => `Price: ${v}`}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="Too cheap"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Bargain"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Expensive"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Too expensive"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
          Willingness to pay by archetype
        </p>
        <div className="space-y-2.5">
          {result.segment_commentary.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-20 shrink-0 text-right">
                <p className="font-semibold tabular-nums text-ink-900 dark:text-white">
                  {s.willingness_to_pay.toFixed(0)}
                </p>
                <p className="text-2xs muted">{currency.split(" ")[0]}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 dark:text-white">
                  {s.archetypeName}
                </p>
                <p className="text-xs italic muted line-clamp-2">
                  "{s.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
