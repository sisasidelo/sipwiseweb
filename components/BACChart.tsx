"use client";

import { SimulationResult } from "@/types";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface BACChartProps {
  result: SimulationResult;
}

export default function BACChart({ result }: BACChartProps) {
  const data = result.snapshots.map((s) => ({
    time: format(new Date(s.timestamp), "HH:mm"),
    BAC: s.bac,
    BrAC: s.brac,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis
            yAxisId="left"
            label={{ value: "BAC (g/dL)", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "BrAC (g/210L)",
              angle: 90,
              position: "insideRight",
            }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="BAC"
            stroke="#2563eb"
            yAxisId="left"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="BrAC"
            stroke="#16a34a"
            yAxisId="right"
            dot={false}
          />
          <ReferenceLine
            y={0.05}
            yAxisId="left"
            stroke="red"
            strokeDasharray="3 3"
            label="Legal Limit (0.05)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
