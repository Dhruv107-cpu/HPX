"use client";

import { useEffect, useState, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  getLiveGenerationSummary,
  getLiveGenerationTrend,
  getGenerationTrend,
  fetchLatestMERIT,
} from "@/services/powerService";
import {
  LiveGenerationSummary,
  LiveGenerationTrend,
  GenerationTrend,
} from "@/types/power";
import {
  formatISTDate,
  formatISTDateTime,
  formatISTDayMonthWithYear,
  formatISTMonthYear,
  formatISTTime,
  formatISTTrendClock,
  formatISTTrendClockDateTime,
  formatISTTrendDateTime,
  formatISTTrendHour,
  getISTYear,
} from "@/utils/dateTime";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";

export default function PowerPage() {
  const [summary, setSummary] = useState<LiveGenerationSummary | null>(null);

  const [demandTrend, setDemandTrend] =
  useState<LiveGenerationTrend[]>([]);

const [generationTrend, setGenerationTrend] =
  useState<GenerationTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState("15m");

  const loadDashboard = useCallback(async (selectedInterval: string) => {
  setLoading(true);

  try {
    const [
      summaryResponse,
      demandTrendResponse,
      generationTrendResponse,
    ] = await Promise.all([
      getLiveGenerationSummary(),
      getLiveGenerationTrend(selectedInterval),
      getGenerationTrend(),
    ]);

    setSummary(summaryResponse);

    setDemandTrend(demandTrendResponse);

    setGenerationTrend(generationTrendResponse);

  } catch (error) {
    console.error("Dashboard Load Error:", error);
  } finally {
    setLoading(false);
  }
}, []);

  const handleFetchLatest = async () => {
    try {
      setLoading(true);
      await fetchLatestMERIT();
      await loadDashboard(interval);
    } catch (error) {
      console.error("MERIT Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(interval);
  }, [interval, loadDashboard]);

  if (loading && !summary) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <h1 className="text-2xl font-bold text-[#005BAC]">Loading Live Generation Dashboard...</h1>
        </div>
      </AppLayout>
    );
  }

  const generationMix = summary
    ? [
        { source: "Thermal", generation: summary.thermal_generation },
        { source: "Hydro", generation: summary.hydro_generation },
        { source: "Renewable", generation: summary.renewable_generation },
        { source: "Gas", generation: summary.gas_generation },
        { source: "Nuclear", generation: summary.nuclear_generation },
        { source: "Storage", generation: summary.storage_generation },
        { source: "Other", generation: summary.other_generation },
      ]
    : [];

  const trendReferenceTimestamp = summary?.report_timestamp || summary?.fetched_at;
  const trendYear = getISTYear(trendReferenceTimestamp);

  const formatTrendTick = (value: string) => {
    const fallback = String(value ?? "");
    if (interval === "daily") return formatISTDayMonthWithYear(value, trendYear, fallback);
    if (interval === "monthly") return formatISTMonthYear(value, fallback);
    if (interval === "hourly") return formatISTTrendHour(value, trendYear, fallback);
    if (interval === "15m") return formatISTTrendClock(value, trendReferenceTimestamp, fallback);
    return formatISTTime(value, fallback);
  };

  const formatTrendTooltipLabel = (value: string) => {
    const fallback = String(value ?? "");
    if (interval === "daily") return formatISTDayMonthWithYear(value, trendYear, fallback);
    if (interval === "monthly") return formatISTMonthYear(value, fallback);
    if (interval === "hourly") return formatISTTrendDateTime(value, trendYear, fallback);
    if (interval === "15m") return formatISTTrendClockDateTime(value, trendReferenceTimestamp, fallback);
    return formatISTDateTime(value, fallback);
  };

  return (
    <AppLayout>
      <div className="bg-gray-100 min-h-screen p-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-[#0B1A2E]">Live Generation Dashboard</h1>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">● LIVE</span>
            </div>
            <p className="text-gray-600 mt-2">MERIT India Live Analytics</p>
            {/* RESTORED: Last Updated Timestamp */}
            {summary && (
              <p className="text-sm text-gray-500 mt-1">
                Last Updated :
                <span className="font-semibold ml-2">
                  {formatISTDateTime(summary.fetched_at)}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white shadow-sm cursor-pointer hover:border-[#005BAC]"
            >
              <option value="15m">15 Minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              disabled={loading}
              onClick={handleFetchLatest}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
            >
              {loading ? "Syncing..." : "Sync MERIT"}
            </button>
          </div>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-8">
          {[
            { label: "Demand", val: summary?.demand_met, color: "text-blue-600" },
            { label: "Thermal", val: summary?.thermal_generation, color: "text-red-500" },
            { label: "Gas", val: summary?.gas_generation, color: "text-orange-500" },
            { label: "Nuclear", val: summary?.nuclear_generation, color: "text-purple-600" },
            { label: "Hydro", val: summary?.hydro_generation, color: "text-cyan-600" },
            { label: "Renewable", val: summary?.renewable_generation, color: "text-green-600" },
            { label: "Storage", val: summary?.storage_generation, color: "text-indigo-600" },
            { label: "Other", val: summary?.other_generation, color: "text-pink-600" },
            { label: "Exchange", val: summary?.transnational_exchange, color: (summary?.transnational_exchange ?? 0) >= 0 ? "text-green-700" : "text-red-600" },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition cursor-pointer">
              <p className="text-gray-500 text-sm">{kpi.label}</p>
              <h2 className={`text-2xl font-bold ${kpi.color} mt-2`}>{kpi.val?.toLocaleString() ?? "0"}</h2>
              <p className="text-gray-400 text-xs mt-1">MW</p>
            </div>
          ))}
        </div>

        {/* Chart 1: Demand Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full cursor-pointer hover:shadow-2xl transition-shadow">
          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-5">Real Time All India Demand Met (MW)</h2>
          <div className="w-full h-[400px]">
            {demandTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No demand trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(value) => formatTrendTick(value)} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip labelFormatter={(label) => formatTrendTooltipLabel(label as string)} />
                  <Line type="monotone" dataKey="demand_met" stroke="#E11D48" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Generation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full cursor-pointer hover:shadow-2xl transition-shadow">
          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-5">Real Time All India Generation (MW)</h2>
          <div className="w-full h-[400px]">
            {generationTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No generation trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(value) => formatTrendTick(value)} />
                  <YAxis />
                  <Tooltip labelFormatter={(label) => formatTrendTooltipLabel(label as string)} />
                  <Area type="monotone" dataKey="thermal_generation" stackId="1" stroke="#F97316" fill="#F97316" />
                  <Area type="monotone" dataKey="hydro_generation" stackId="1" stroke="#0EA5E9" fill="#0EA5E9" />
                  <Area type="monotone" dataKey="renewable_generation" stackId="1" stroke="#22C55E" fill="#22C55E" name="Renewable" />
                  <Area type="monotone" dataKey="gas_generation" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Gas" />
                  <Area type="monotone" dataKey="nuclear_generation" stackId="1" stroke="#A855F7" fill="#A855F7" name="Nuclear" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Generation Mix */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full cursor-pointer hover:shadow-2xl transition-shadow">
          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-5">Generation Mix</h2>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generationMix}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="generation" fill="#005BAC" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
