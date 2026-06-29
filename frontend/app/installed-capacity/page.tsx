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
  value: number;
};

type UploadedCapacityFile = {
  file_name: string;
  created_at: string;
  is_active: boolean;
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
  payload?: Array<{
    payload: RegionCapacity;
  }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const region = payload[0].payload;

  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 text-black">
      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
        {region.name}
      </p>
      <p className="text-[11px] text-gray-500">
        Installed Capacity: {region.value.toLocaleString()} MW
      </p>
      <p className="text-[11px] text-gray-500">
        Percentage of Total: {region.percentage.toFixed(2)}%
      </p>
    </div>
  );
};

const StateTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: StateCapacity;
  }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const state = payload[0].payload;

  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 text-black">
      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
        {state.name}
      </p>
      <p className="text-[11px] text-gray-500">
        Installed Capacity: {state.value.toLocaleString()} MW
      </p>
    </div>
  );
};

// 📍 Static State-wise Capacity Datasets (Kept as fallback or secondary data)
const stateCapacityData = [
  { name: "Maharashtra", capacityMW: 28000, operationalMW: 25500 },
  { name: "Gujarat", capacityMW: 21000, operationalMW: 19800 },
  { name: "Tamil Nadu", capacityMW: 19500, operationalMW: 18200 },
  { name: "Karnataka", capacityMW: 16000, operationalMW: 14900 },
  { name: "Uttar Pradesh", capacityMW: 15000, operationalMW: 13100 },
  { name: "Delhi NCR", capacityMW: 8500, operationalMW: 7800 },
];

export default function InstalledCapacityPage() {
  const [regionData, setRegionData] = useState<RegionCapacity[]>([]);
  const [stateData, setStateData] = useState<StateCapacity[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [latestReportMonth, setLatestReportMonth] = useState("Unavailable");
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const data = await getRegionSummary();
      const total = data.reduce(
        (sum: number, region: { value: number }) => sum + region.value,
        0
      );
      const chartData = data.map((region: { name: string; value: number }) => ({
        ...region,
        percentage: total > 0 ? (region.value / total) * 100 : 0,
      }));
      const defaultRegion = chartData.reduce<RegionCapacity | null>(
        (largest, region) =>
          !largest || region.value > largest.value ? region : largest,
        null
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
        .filter((file: UploadedCapacityFile) =>
          file.file_name.toLowerCase().includes("capacity")
        )
        .sort(
          (a: UploadedCapacityFile, b: UploadedCapacityFile) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
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
            value: state.value,
          }))
          .sort((a: StateCapacity, b: StateCapacity) => b.value - a.value)
      );
    } catch (err) {
      console.error(err);
      setStateData([]);
    } finally {
      setStateLoading(false);
    }
  };

  const handleRegionSelect = (region: RegionCapacity) => {
    setSelectedRegionName(region.name);
    loadStates(region.name);
  };

  const totalInstalledCapacity = regionData.reduce(
    (sum, region) => sum + region.value,
    0
  );
  const largestRegion = regionData.reduce<RegionCapacity | null>(
    (largest, region) =>
      !largest || region.value > largest.value ? region : largest,
    null
  );
  const selectedRegion =
    regionData.find((region) => region.name === selectedRegionName) ??
    largestRegion;
  const kpiCards = [
    {
      title: "Total Installed Capacity",
      value: `${totalInstalledCapacity.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} MW`,
    },
    {
      title: "Largest Region",
      value: largestRegion?.name ?? "Unavailable",
    },
    {
      title: "Total Regions",
      value: regionData.length,
    },
    {
      title: "Latest Report Month",
      value: latestReportMonth,
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2 text-black">
        
        {/* Page Top Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Installed Generation Capacity Matrix</h1>
          <p className="text-gray-500 mt-1">
            Comprehensive power grid telemetry: Bar charts and line graphs for both regional zones and states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {kpiCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-gray-500 text-sm">
                  {card.title}
                </h3>
              </div>

              <p className="text-3xl font-bold mt-3">
                {card.value}
              </p>

              <p className="text-green-600 text-sm mt-2">
                Updated Today
              </p>
            </div>
          ))}
        </div>

        {/* 4-BLOCK GRID SYSTEM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

          {/* 1. REGION CAPACITY - BAR CHART */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                🌐 Regional Allocation Comparisons (Bar)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Installed vs Active power distribution by geographic sectors.</p>
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
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    onClick={(entry) =>
                      handleRegionSelect(
                        entry as unknown as RegionCapacity
                      )
                    }
                  >
                    {regionData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={regionColors[index % regionColors.length]}
                        stroke={
                          selectedRegion?.name === entry.name
                            ? "#0B1A2E"
                            : "#FFFFFF"
                        }
                        strokeWidth={selectedRegion?.name === entry.name ? 4 : 1}
                        opacity={
                          selectedRegion?.name === entry.name ? 1 : 0.82
                        }
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
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Region Details
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Selected regional installed generation capacity summary.</p>
            </div>
            <div className="h-64 cursor-pointer">
              <div className="h-full bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Region Name
                  </p>
                  <p className="text-3xl font-bold mt-3">
                    {selectedRegion?.name ?? "Unavailable"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">
                      Installed Capacity (MW)
                    </p>
                    <p className="text-xl font-bold">
                      {selectedRegion
                        ? selectedRegion.value.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })
                        : "Unavailable"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400 mb-1">
                      Percentage of Total Capacity
                    </p>
                    <p className="text-xl font-bold">
                      {selectedRegion
                        ? `${selectedRegion.percentage.toFixed(2)}%`
                        : "Unavailable"}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400">
                  State details will be loaded here.
                </p>
              </div>
            </div>
          </div>

          {/* 3. STATE CAPACITY - BAR CHART */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                📍 State Infrastructure Volumes (Bar)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Comparative volumetric tracking breakdown across individual states.</p>
            </div>
            <div className="h-64 cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateCapacityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" MW" />
                  <Tooltip formatter={(value) => [`${(value as number).toLocaleString()} MW`]} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B89D1" radius={[4, 4, 0, 0]} name="State Installed" />
                  <Bar dataKey="operationalMW" fill="#34D399" radius={[4, 4, 0, 0]} name="State Operational" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. STATE CAPACITY - LINE GRAPH */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                📍 State Telemetry Metrics (Graph)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Capacity distribution paths plotting territorial growth targets.</p>
            </div>
            <div className="h-64 cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stateCapacityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={11} unit=" MW" />
                  <Tooltip formatter={(value) => [`${(value as number).toLocaleString()} MW`]} />
                  <Legend />
                  <Line type="monotone" dataKey="capacityMW" stroke="#3B89D1" strokeWidth={3} activeDot={{ r: 6 }} name="Current Installed" />
                  <Line type="monotone" dataKey="operationalMW" stroke="#34D399" strokeWidth={2} name="Current Operational" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
