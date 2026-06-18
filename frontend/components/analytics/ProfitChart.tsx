"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"; 

interface ProfitChartProps {
  data: {
    month: string;
    profit: number;
  }[];
}

export default function ProfitChart({
  data,
}: ProfitChartProps) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow">
      <h2 className="text-lg font-semibold mb-4">
        Monthly Profit
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />

  <XAxis dataKey="month" />
  <YAxis />

  <Tooltip />
  <Legend />

  <Line
    type="monotone"
    dataKey="profit"
    stroke="#005BAC"
    strokeWidth={3}
    name="Profit"
  />
</LineChart>
      </ResponsiveContainer>
    </div>
  );
}