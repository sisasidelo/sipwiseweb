"use client";

import { SimulationResult } from "@/types";
import { LEGAL_LIMITS } from "@/lib/constants";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface BACChartProps {
  result: SimulationResult;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-primary)",
        borderRadius: 8,
        padding: "10px 14px",
        color: "var(--color-text)",
        fontSize: 13,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 6, opacity: 0.7 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: "2px 0" }}>
          <span style={{ fontWeight: 600 }}>{entry.name}</span>:{" "}
          {entry.value.toFixed(4)}{" "}
          <span style={{ opacity: 0.6, fontSize: 11 }}>
            {entry.name === "BAC" ? "g/dL" : "mg/L"}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function BACChart({ result }: BACChartProps) {
  const data = result.snapshots.map((s) => ({
    time: format(new Date(s.timestamp), "HH:mm"),
    BAC: s.bac,
    BrAC: s.brac,
  }));

  const isOverLimit = result.peakBAC > LEGAL_LIMITS.BAC;
  const legalTime = result.legalLimitTime
    ? format(new Date(result.legalLimitTime), "HH:mm")
    : null;
  const soberTime = format(new Date(result.soberTime), "HH:mm");
  const peakTime = format(new Date(result.peakTime), "HH:mm");

  return (
    <div
      className="rounded-xl border border-primary/30 bg-bg shadow-lg overflow-hidden"
    >
      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-primary/20 border-b border-primary/30 text-center">
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Peak BAC</p>
          <p
            className="text-2xl font-bold tabular-nums"
            style={{ color: isOverLimit ? "#ef4444" : "var(--color-secondary)" }}
          >
            {result.peakBAC.toFixed(3)}
          </p>
          <p className="text-xs opacity-40">g/dL at {peakTime}</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Peak BrAC</p>
          <p
            className="text-2xl font-bold tabular-nums"
            style={{
              color:
                result.peakBrAC > LEGAL_LIMITS.BRAC
                  ? "#ef4444"
                  : "var(--color-secondary)",
            }}
          >
            {result.peakBrAC.toFixed(3)}
          </p>
          <p className="text-xs opacity-40">mg/L</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Legal by</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-primary)" }}>
            {legalTime ?? "—"}
          </p>
          <p className="text-xs opacity-40">{legalTime ? "HH:mm" : "already legal"}</p>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Sober at</p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-primary)" }}>
            {soberTime}
          </p>
          <p className="text-xs opacity-40">HH:mm</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 pt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-text)"
              strokeOpacity={0.08}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "var(--color-text)", fontSize: 11, opacity: 0.6 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-text)", strokeOpacity: 0.15 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "var(--color-text)", fontSize: 11, opacity: 0.6 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toFixed(3)}
              label={{
                value: "BAC (g/dL)",
                angle: -90,
                position: "insideLeft",
                offset: 14,
                style: {
                  fill: "var(--color-primary)",
                  fontSize: 11,
                  fontWeight: 600,
                },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "var(--color-text)", fontSize: 11, opacity: 0.6 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toFixed(3)}
              label={{
                value: "BrAC (mg/L)",
                angle: 90,
                position: "insideRight",
                offset: 14,
                style: {
                  fill: "var(--color-secondary)",
                  fontSize: 11,
                  fontWeight: 600,
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                color: "var(--color-text)",
                fontSize: 12,
                paddingTop: 8,
                opacity: 0.8,
              }}
            />
            <Line
              type="monotone"
              dataKey="BAC"
              stroke="var(--color-primary)"
              yAxisId="left"
              dot={false}
              strokeWidth={2.5}
              activeDot={{ r: 4, fill: "var(--color-primary)" }}
            />
            <Line
              type="monotone"
              dataKey="BrAC"
              stroke="var(--color-secondary)"
              yAxisId="right"
              dot={false}
              strokeWidth={2}
              strokeDasharray="6 3"
              activeDot={{ r: 4, fill: "var(--color-secondary)" }}
            />
            <ReferenceLine
              y={LEGAL_LIMITS.BAC}
              yAxisId="left"
              stroke="#ef4444"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `${LEGAL_LIMITS.BAC} g/dL`,
                position: "insideTopRight",
                fill: "#ef4444",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <ReferenceLine
              y={LEGAL_LIMITS.BRAC}
              yAxisId="right"
              stroke="#f97316"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `${LEGAL_LIMITS.BRAC} mg/L`,
                position: "insideBottomRight",
                fill: "#f97316",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-4">
        <p className="text-xs leading-relaxed opacity-50 border-t border-primary/15 pt-3">
          ⚠️ <strong>Simulated estimates only.</strong> BAC values are calculated
          using the Widmark formula and are affected by food intake, hydration,
          medication, individual metabolism, and other factors not accounted for
          here. Do not use this to determine whether you are safe or legal to
          drive. <strong>If in doubt, don&apos;t drive.</strong> Legal limits
          shown are for South Africa (BAC {LEGAL_LIMITS.BAC}&nbsp;g/dL,
          BrAC {LEGAL_LIMITS.BRAC}&nbsp;mg/L).
        </p>
      </div>
    </div>
  );
}
