"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
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
  LineChart,
  Line,
} from "recharts";
import {
  getRegionSummary,
  getStateSummary,
} from "@/services/installedCapacityService";
import { getFiles } from "@/services/fileService";

type RegionCapacity = {
  name: string;
  value: number;
  percentage: number;
};

type StateCapacity = {
  name: string;
  installedMW: number;
};

type UploadedCapacityFile = {
  file_name: string;
  created_at: string;
  is_active: boolean;
};

const monthlyTrendMockData: Record<string, Array<{ month: string; installedMW: number }>> = {
  Western: [
    { month: "Jan", installedMW: 185000 },
    { month: "Feb", installedMW: 188000 },
    { month: "Mar", installedMW: 192000 },
    { month: "Apr", installedMW: 195682 },
    { month: "May", installedMW: 198200 },
  ],
  Eastern: [
    { month: "Jan", installedMW: 90000 },
    { month: "Feb", installedMW: 91000 },
    { month: "Mar", installedMW: 93000 },
    { month: "Apr", installedMW: 95000 },
    { month: "May", installedMW: 96800 },
  ],
  Northern: [
    { month: "Jan", installedMW: 120000 },
    { month: "Feb", installedMW: 122000 },
    { month: "Mar", installedMW: 125000 },
    { month: "Apr", installedMW: 128000 },
    { month: "May", installedMW: 129900 },
  ],
  Southern: [
    { month: "Jan", installedMW: 140000 },
    { month: "Feb", installedMW: 142000 },
    { month: "Mar", installedMW: 145000 },
    { month: "Apr", installedMW: 147000 },
    { month: "May", installedMW: 149500 },
  ],
  "North Eastern": [
    { month: "Jan", installedMW: 35000 },
    { month: "Feb", installedMW: 36000 },
    { month: "Mar", installedMW: 37000 },
    { month: "Apr", installedMW: 39000 },
    { month: "May", installedMW: 40100 },
  ],
};

const regionColors = ["#005BAC", "#10B981", "#3B89D1", "#34D399", "#64748B"];

const formatReportMonth = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const RegionTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RegionCapacity }>;
}) => {
  if (!active || !payload?.length) return null;
  const region = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 text-black">
      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">{region.name}</p>
      <p className="text-[11px] text-gray-500">Installed Capacity: {region.value.toLocaleString()} MW</p>
      <p className="text-[11px] text-gray-500">Percentage of Total: {region.percentage.toFixed(2)}%</p>
    </div>
  );
};

export default function InstalledCapacityPage() {
  const [regionData, setRegionData] = useState<RegionCapacity[]>([]);
  const [stateData, setStateData] = useState<StateCapacity[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [latestReportMonth, setLatestReportMonth] = useState("Unavailable");
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await getRegionSummary();
      const total = data.reduce((sum: number, region: { value: number }) => sum + region.value, 0);
      const chartData = data.map((region: { name: string; value: number }) => ({
        ...region,
        percentage: total > 0 ? (region.value / total) * 100 : 0,
      }));
      
      const defaultRegion = chartData.reduce((largest: RegionCapacity | null, region: RegionCapacity) =>
        !largest || region.value > largest.value ? region : largest,
        null as RegionCapacity | null
      );

      setRegionData(chartData);

      if (defaultRegion) {
        setSelectedRegionName(defaultRegion.name);
        loadStates(defaultRegion.name);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const files = await getFiles();
      const latestCapacityFile = files
        .filter((file: UploadedCapacityFile) => file.is_active)
        .filter((file: UploadedCapacityFile) => file.file_name.toLowerCase().includes("capacity"))
        .sort((a: UploadedCapacityFile, b: UploadedCapacityFile) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

      if (latestCapacityFile?.created_at) {
        setLatestReportMonth(formatReportMonth(latestCapacityFile.created_at));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStates = async (region: string) => {
    setStateLoading(true);
    try {
      const data = await getStateSummary(region);
      setStateData(
        data
          .map((state: { name: string; value: number }) => ({
            name: state.name,
            installedMW: state.value,
          }))
          .sort((a: StateCapacity, b: StateCapacity) => b.installedMW - a.installedMW)
      );
    } catch (err) {
      console.error(err);
      setStateData([]);
    } finally {
      setStateLoading(false);
    }
  };

  const handleRegionSelect = (entry: any) => {
    const targetRegion = entry?.payload?.name ? entry.payload : entry;
    if (targetRegion && targetRegion.name) {
      setSelectedRegionName(targetRegion.name);
      loadStates(targetRegion.name);
    }
  };

  const totalInstalledCapacity = regionData.reduce((sum, region) => sum + region.value, 0);
  const largestRegion = regionData.reduce((largest: RegionCapacity | null, region: RegionCapacity) => 
    (!largest || region.value > largest.value ? region : largest),
    null as RegionCapacity | null
  );
  
  const selectedRegion = regionData.find((region) => region.name === selectedRegionName) ?? largestRegion;
  const currentLineChartData = selectedRegionName ? (monthlyTrendMockData[selectedRegionName] || []) : [];

  const kpiCards = [
    {
      title: "Total Installed Capacity",
      value: `${totalInstalledCapacity.toLocaleString(undefined, { maximumFractionDigits: 2 })} MW`,
    },
    { title: "Largest Region", value: largestRegion?.name ?? "Unavailable" },
    { title: "Total Regions", value: regionData.length },
    { title: "Latest Report Month", value: latestReportMonth },
  ];

  return (
    <AppLayout>
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2 text-black">
        
        {/* Page Top Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Installed Generation Capacity Matrix</h1>
          <p className="text-gray-500 mt-1">
            Comprehensive power grid telemetry based on structural assets footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {kpiCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
              <h3 className="text-gray-500 text-sm">{card.title}</h3>
              <p className="text-3xl font-bold mt-3">{card.value}</p>
              <p className="text-blue-600 text-sm mt-2">Static Asset Data</p>
            </div>
          ))}
        </div>

        {/* 4-BLOCK GRID SYSTEM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

          {/* 1. REGION CAPACITY - PIE CHART */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                🌐 Regional Installed Allocation Comparisons (Pie)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Click a slice to filter State details and Monthly trends below.</p>
            </div>
            <div className="h-64 cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<RegionTooltip />} />
                  <Legend />
                  <Pie
                    data={regionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={0}
                    outerRadius={110}
                    paddingAngle={2}
                    onClick={handleRegionSelect}
                  >
                    {regionData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={regionColors[index % regionColors.length]}
                        stroke={selectedRegion?.name === entry.name ? "#0B1A2E" : "#FFFFFF"}
                        strokeWidth={selectedRegion?.name === entry.name ? 4 : 1}
                        opacity={selectedRegion?.name === entry.name ? 1 : 0.82}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. REGION DETAILS PANEL */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Region Details</h2>
              <p className="text-[11px] text-gray-400 mb-4">Selected regional structural installed capacity summary.</p>
            </div>
            <div className="h-64">
              <div className="h-full bg-slate-50 rounded-xl border border-gray-100 p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active View Filter</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{selectedRegion?.name ?? "Unavailable"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">Installed Capacity (MW)</p>
                    <p className="text-xl font-bold text-slate-700">
                      {selectedRegion ? selectedRegion.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">Percentage of Total Capacity</p>
                    <p className="text-xl font-bold text-slate-700">
                      {selectedRegion ? `${selectedRegion.percentage.toFixed(2)}%` : "Unavailable"}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-blue-600 font-medium">✨ Displaying structural breakdown maps below</p>
              </div>
            </div>
          </div>

          {/* 3. STATE CAPACITY - DYNAMIC BAR CHART */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                📍 State Installed Capacity Footprint ({selectedRegionName || "Selected"} Region)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Dynamic state metrics loaded from selection.</p>
            </div>
            {/* MODIFIED: Increased container height to h-80 to make room for rotated labels */}
            <div className="h-80">
              {stateLoading ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">Loading state allocation charts...</div>
              ) : stateData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No states data found for this region.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateData} margin={{ bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    {/* MODIFIED: Added interval={0} to force every state to render, and rotated them by -45 degrees */}
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748B" 
                      fontSize={10} 
                      tickLine={false} 
                      interval={0} 
                      angle={-45} 
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" MW" />
                    <Tooltip formatter={(value) => [`${(value as number).toLocaleString()} MW`]} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="installedMW" fill="#005BAC" radius={[4, 4, 0, 0]} name="State Installed (MW)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 4. DYNAMIC REGIONAL MONTHLY REPORT - LINE GRAPH */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                📈 Monthly Regional Installed Capacity Trend ({selectedRegionName || "Selected"} Region)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Historical structural growth patterns for the selected zone.</p>
            </div>
            <div className="h-64">
              {currentLineChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">Select a region to load timeline telemetry.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentLineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} unit=" MW" />
                    <Tooltip formatter={(value) => [`${(value as number).toLocaleString()} MW`]} />
                    <Legend />
                    <Line type="monotone" dataKey="installedMW" stroke="#005BAC" strokeWidth={3} activeDot={{ r: 6 }} name="Total Installed Trend" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}