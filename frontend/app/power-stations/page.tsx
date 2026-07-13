"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import IndiaMap from "@/components/maps/IndiaMap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  getPowerStationPortfolio,
  getPowerStations,
} from "@/services/powerStationService";

import {
  PowerStation,
  PowerStationPortfolio,
} from "@/types/powerStation";

const renderPortfolioPieLabel = ({ percent = 0 }: { percent?: number }) =>
  `${(percent * 100).toFixed(1)}%`;

export default function PowerStationPage() {

  const [stations, setStations] = useState<PowerStation[]>([]);
  const [portfolioData, setPortfolioData] =
  useState<PowerStationPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [stateCode, setStateCode] = useState("rj");
  const [generationType, setGenerationType] = useState("");
  const [limit, setLimit] = useState(20);

  const loadStations = useCallback(async () => {
    setLoading(true);

  try{
    const data = await getPowerStations({
  state_code: stateCode,
  generation_type: generationType,
  limit,
});

      setStations(data);

    } catch (error) {
      console.error("Power Station Error:", error);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [stateCode, generationType, limit]);

  const loadPortfolio = useCallback(async () => {
    if (!stateCode) {
      setPortfolioData(null);
      return;
    }

    try {
      const data = await getPowerStationPortfolio(stateCode);
      setPortfolioData(data);
    } catch (error) {
      console.error("Power Station Portfolio Error:", error);
      setPortfolioData(null);
    }
  }, [stateCode]);

  useEffect(() => {
    loadStations();
    loadPortfolio();
  }, [loadStations, loadPortfolio]);

  const handleStateClick = useCallback((code: string) => {
    setStateCode(code);
  }, []);

  const totalScheduled = useMemo(() => {

    return stations.reduce(
      (sum, station) => sum + station.scheduled_generation,
      0
    );

  }, [stations]);

  const totalNonScheduled = useMemo(() => {

    return stations.reduce(
      (sum, station) => sum + station.non_scheduled_generation,
      0
    );

  }, [stations]);

  const generationTypes = useMemo(() => {

    return [...new Set(stations.map(
      station => station.generation_type
    ))];

  }, [stations]);

  const chartData = useMemo(() => {
    return stations.map(station => ({
      station: station.station_name,
      scheduled: station.scheduled_generation,
      nonScheduled: station.non_scheduled_generation,
    }));
  }, [stations]);

  const portfolioGenerationData = useMemo(() => {
    if (!portfolioData) return [];

    return [
      {
        name: "Thermal Generation",
        value: portfolioData.thermal_generation,
        color: "#DC2626",
      },
      {
        name: "Renewable Generation",
        value: portfolioData.renewable_generation,
        color: "#16A34A",
      },
      {
        name: "Hydro Generation",
        value: portfolioData.hydro_generation,
        color: "#0891B2",
      },
      {
        name: "Gas Generation",
        value: portfolioData.gas_generation,
        color: "#D97706",
      },
      {
        name: "Nuclear Generation",
        value: portfolioData.nuclear_generation,
        color: "#9333EA",
      },
    ];
  }, [portfolioData]);

  if (loading && !hasLoaded) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <h1 className="text-2xl font-bold text-[#005BAC]">
            Loading Power Station Dashboard...
          </h1>
        </div>
      </AppLayout>
    );
  }
    return (
    <AppLayout>
      <div className="bg-gray-100 min-h-screen p-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

          <div>
            <h1 className="text-4xl font-bold text-[#0B1A2E]">
              Power Station Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Latest Power Station Analytics
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {stations.length} Stations Loaded
            </p>
          </div>

          <button
            onClick={loadStations}
            className="bg-[#005BAC] hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
          >
            Refresh
          </button>

        </div>


        {/* Filters */}

        <div className="bg-white rounded-xl shadow-lg p-5 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* State */}

            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">All States</option>

              <option value="rj">Rajasthan</option>

              <option value="gj">Gujarat</option>

              <option value="up">Uttar Pradesh</option>

              <option value="mh">Maharashtra</option>

            </select>

            {/* Fuel */}

            <select
              value={generationType}
              onChange={(e) => setGenerationType(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">All Generation Types</option>

              <option value="Thermal">Thermal</option>

              <option value="Hydro">Hydro</option>

              <option value="Gas">Gas</option>

              <option value="Nuclear">Nuclear</option>

              <option value="Renewable">Renewable</option>

            </select>

            {/* Top N */}

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded-lg px-4 py-2"
            >
              <option value={10}>Top 10</option>

              <option value={20}>Top 20</option>

              <option value={50}>Top 50</option>

            </select>

          </div>

        </div>
             
<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
  <h2 className="text-2xl font-bold text-[#0B1A2E] mb-6">
    Select a State
  </h2>

  <IndiaMap
  selectedState={stateCode}
  onStateClick={handleStateClick}
/>
</div>

        {portfolioData && (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

    <h2 className="text-2xl font-bold text-[#0B1A2E] mb-6">
      {portfolioData.state_name} Portfolio
    </h2>

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.35fr_1fr] gap-6">

      <div className="bg-[#0B1A2E] rounded-lg p-6 text-white">
        <p className="text-sm text-blue-100">
          State Portfolio
        </p>

        <h3 className="text-3xl font-bold mt-2">
          {portfolioData.state_name}
        </h3>

        <div className="mt-6 space-y-4">
          <div className="border-t border-white/15 pt-4">
            <p className="text-sm text-blue-100">
              Total Stations
            </p>

            <p className="text-2xl font-bold mt-1">
              {portfolioData.total_stations}
            </p>
          </div>

          <div className="border-t border-white/15 pt-4">
            <p className="text-sm text-blue-100">
              Scheduled Generation
            </p>

            <p className="text-2xl font-bold mt-1">
              {portfolioData.total_scheduled_generation.toLocaleString()}
            </p>

            <p className="text-xs text-blue-100 mt-1">
              MW
            </p>
          </div>

          <div className="border-t border-white/15 pt-4">
            <p className="text-sm text-blue-100">
              Non Scheduled Generation
            </p>

            <p className="text-2xl font-bold mt-1">
              {portfolioData.total_non_scheduled_generation.toLocaleString()}
            </p>

            <p className="text-xs text-blue-100 mt-1">
              MW
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-5">
        <h3 className="text-lg font-bold text-[#0B1A2E] mb-4">
          Generation Mix
        </h3>

        <div className="w-full h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioGenerationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={95}
                label={renderPortfolioPieLabel}
              >
                {portfolioGenerationData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()} MW`,
                  "Generation",
                ]}
              />

              <Legend
                verticalAlign="bottom"
                height={72}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
        {portfolioGenerationData.map((item) => (
          <div
            key={item.name}
            className="bg-gray-50 rounded-lg p-4 border-l-4"
            style={{ borderColor: item.color }}
          >
            <p className="text-sm text-gray-500">
              {item.name}
            </p>

            <h3
              className="text-2xl font-bold mt-2"
              style={{ color: item.color }}
            >
              {item.value.toLocaleString()}
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              MW
            </p>
          </div>
        ))}
      </div>

    </div>

  </div>
)}


        {/* KPI Cards */}

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Total Stations
            </p>

            <h2 className="text-3xl font-bold text-[#005BAC] mt-2">
              {stations.length}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Scheduled Generation
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {totalScheduled.toLocaleString()}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              MW
            </p>

          </div>

          <div className="bg-white rounded-xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Non Scheduled
            </p>

            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {totalNonScheduled.toLocaleString()}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              MW
            </p>

          </div>

          <div className="bg-white rounded-xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Generation Types
            </p>

            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {generationTypes.length}
            </h2>

          </div>

        </div>
                {/* Scheduled Generation Chart */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-5">
            Top Power Stations
          </h2>

          <div className="w-full h-[500px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="station"
                  tick={{ fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={120}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="scheduled"
                  fill="#005BAC"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Scheduled vs Non Scheduled */}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">

          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-5">
            Scheduled vs Non Scheduled
          </h2>

          <div className="w-full h-[500px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="station"
                  tick={{ fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={120}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="scheduled"
                  fill="#16A34A"
                />

                <Bar
                  dataKey="nonScheduled"
                  fill="#EA580C"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Table */}

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-5">
            Power Station Details
          </h2>

          <div className="overflow-x-auto">

            <table className="min-w-full border border-gray-200">

              <thead>

                <tr className="bg-[#005BAC] text-white">

                  <th className="px-4 py-3 text-left">
                    Station
                  </th>

                  <th className="px-4 py-3 text-left">
                    Generation Type
                  </th>

                  <th className="px-4 py-3 text-right">
                    Scheduled
                  </th>

                  <th className="px-4 py-3 text-right">
                    Non Scheduled
                  </th>

                </tr>

              </thead>

              <tbody>

                {stations.map((station, index) => (

                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-4 py-3">
                      {station.station_name}
                    </td>

                    <td className="px-4 py-3">
                      {station.generation_type}
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      {station.scheduled_generation.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {station.non_scheduled_generation.toLocaleString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </AppLayout>

  );

}
