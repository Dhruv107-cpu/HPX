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
  getDGRSummary,
  getDGRRegions,
} 
from "@/services/dgrService";

// Structure reflecting the CEA Sub-Report 1 and Sub-Report 2 telemetry metrics
type RegionalGenerationData = {
  name: string; // Northern, Western, Southern, Eastern, North Eastern
  installedCapacityMW: number;
  monitoredCapacityMW: number;
  todaysProgramMU: number;
  todaysActualMU: number;
  deviationMU: number;
  percentageDeviation: number;
};

type StateGenerationData = {
  name: string; // Delhi, Haryana, Punjab, etc.
  monitoredCapacityMW: number;
  todaysProgramMU: number;
  todaysActualMU: number;
  capacityUnderOutageMW: number;
};

// Mock data structured cleanly from your mentor's uploaded dgr1 and dgr2 24-Jun-2026 reports


const mockStateBreakdown: Record<string, StateGenerationData[]> = {
  Northern: [
    { name: "Delhi", monitoredCapacityMW: 2100.40, todaysProgramMU: 11.67, todaysActualMU: 14.37, capacityUnderOutageMW: 480.40 },
    { name: "Haryana", monitoredCapacityMW: 5880.00, todaysProgramMU: 88.40, todaysActualMU: 82.10, capacityUnderOutageMW: 900.00 },
    { name: "Punjab", monitoredCapacityMW: 6420.00, todaysProgramMU: 95.10, todaysActualMU: 99.40, capacityUnderOutageMW: 300.00 },
    { name: "Uttar Pradesh", monitoredCapacityMW: 14500.00, todaysProgramMU: 220.50, todaysActualMU: 214.20, capacityUnderOutageMW: 1850.00 },
    { name: "Rajasthan", monitoredCapacityMW: 9800.00, todaysProgramMU: 140.20, todaysActualMU: 145.80, capacityUnderOutageMW: 660.00 },
  ],
  Western: [
    { name: "Gujarat", monitoredCapacityMW: 32000.00, todaysProgramMU: 510.00, todaysActualMU: 530.40, capacityUnderOutageMW: 2100.00 },
    { name: "Maharashtra", monitoredCapacityMW: 44000.00, todaysProgramMU: 720.00, todaysActualMU: 735.10, capacityUnderOutageMW: 3400.00 },
    { name: "Madhya Pradesh", monitoredCapacityMW: 23000.00, todaysProgramMU: 360.20, todaysActualMU: 368.00, capacityUnderOutageMW: 1100.00 },
  ],
};

// Hourly dispatch variation matrix simulation for Selected Region Day-cycle Analytics
const mockHourlyTelemetry: Record<string, Array<{ hour: string; programMU: number; actualMU: number }>> = {
  Northern: [
    { hour: "00:00", programMU: 52, actualMU: 50 },
    { hour: "04:00", programMU: 48, actualMU: 49 },
    { hour: "08:00", programMU: 58, actualMU: 55 },
    { hour: "12:00", programMU: 65, actualMU: 67 },
    { hour: "16:00", programMU: 62, actualMU: 60 },
    { hour: "20:00", programMU: 70, actualMU: 68 },
  ],
  Western: [
    { hour: "00:00", programMU: 75, actualMU: 76 },
    { hour: "04:00", programMU: 72, actualMU: 74 },
    { hour: "08:00", programMU: 80, actualMU: 83 },
    { hour: "12:00", programMU: 88, actualMU: 91 },
    { hour: "16:00", programMU: 85, actualMU: 88 },
    { hour: "20:00", programMU: 92, actualMU: 94 },
  ],
};

const chartColors = ["#005BAC", "#10B981", "#3B89D1", "#34D399", "#64748B"];

const CustomRegionTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: RegionalGenerationData }> }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 text-black">
      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">{data.name}</p>
      <p className="text-[11px] text-gray-600">Actual Gen: {data.todaysActualMU.toLocaleString()} MU</p>
      <p className="text-[11px] text-gray-600">Target Gen: {data.todaysProgramMU.toLocaleString()} MU</p>
      <p className={`text-[11px] font-semibold ${data.deviationMU >= 0 ? "text-green-600" : "text-red-600"}`}>
        Dev: {data.deviationMU >= 0 ? `+${data.deviationMU}` : data.deviationMU} MU ({data.percentageDeviation.toFixed(2)}%)
      </p>
    </div>
  );
};

export default function DailyGenerationPage() {
  const [selectedRegionName, setSelectedRegionName] = useState<string>("Northern");
  const [activeData, setActiveData] = useState<RegionalGenerationData | null>(null);
const [regionalSummary, setRegionalSummary] =
  useState<RegionalGenerationData[]>([]);

const [summary, setSummary] =
  useState<any>(null);
  useEffect(() => {

  async function loadData() {

    try {

      const summaryResponse =
        await getDGRSummary();

      const regionsResponse =
        await getDGRRegions();

      setSummary(summaryResponse);

      const mappedRegions =
        regionsResponse.map((item: any) => ({

          name: item.name,

          installedCapacityMW:
            item.installed_capacity,

          monitoredCapacityMW:
            item.monitored_capacity,

          todaysProgramMU:
            item.today_program,

          todaysActualMU:
            item.today_actual,

          deviationMU:
            item.deviation,

          percentageDeviation:
            item.deviation_percent

        }));

      setRegionalSummary(
        mappedRegions
      );

      const defaultRegion =
        mappedRegions.find(
          (r: RegionalGenerationData) =>
            r.name === selectedRegionName
        ) || mappedRegions[0];

      setActiveData(
        defaultRegion
      );

    } catch (err) {

      console.error(err);

    }

  }

  loadData();

}, [selectedRegionName]);

  const handleRegionSelect = (entry: any) => {
    const target = entry?.payload?.name ? entry.payload : entry;
    if (target && target.name) {
      setSelectedRegionName(target.name);
    }
  };

  // KPI Computations
  const totalActualGeneration =  summary?.today_actual ?? 0;
  const totalProgrammedGeneration =  summary?.today_program ?? 0;
  const totalMonitoredCapacity =  summary?.total_monitored_capacity ?? 0;
  
  const netDeviation = summary?.deviation ?? 0;

  const currentStatesData = mockStateBreakdown[selectedRegionName] || [];
  const currentHourlyData = mockHourlyTelemetry[selectedRegionName] || mockHourlyTelemetry["Northern"];

  const statsCards = [
    { title: "Total Generation (Today)", value: `${totalActualGeneration.toLocaleString()} MU`, sub: "All India Actual Output" },
    { title: "Target Schedule Plan", value: `${totalProgrammedGeneration.toLocaleString()} MU`, sub: "All India Target Program" },
    { 
      title: "Net Grid Deviation", 
      value: `${netDeviation.toFixed(2)} MU`, 
      sub: netDeviation >= 0 ? "Surplus Generation Performance" : "Deficit Operations Load",
      color: netDeviation >= 0 ? "text-green-600" : "text-red-600" 
    },
    { title: "Total Monitored Footprint", value: `${totalMonitoredCapacity.toLocaleString()} MW`, sub: "Active Monitored Stations Capacity" },
  ];

  return (
    <AppLayout>
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2 text-black">
        
        {/* Header Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">CEA Daily Power Generation Analytics</h1>
          <p className="text-gray-500 mt-1">
            Real-time grid operation tracking dashboard framework based on Sub-Report operational records dated June 24, 2026.
          </p>
        </div>

        {/* Top KPI Cards Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {statsCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">{card.title}</h3>
              <p className={`text-2xl font-bold mt-2 ${card.color || "text-slate-800"}`}>{card.value}</p>
              <p className="text-gray-400 text-[11px] mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Graphs Layout Grid Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

          {/* Block 1: Regional Share Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                📊 Regional Real-Time Generation Share (MU Actual)
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Click a slice segment to filter state allocations and dynamic hourly timelines.</p>
            </div>
            <div className="h-64 cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomRegionTooltip />} />
                  <Legend />
                  <Pie
                    data={regionalSummary}
                    dataKey="todaysActualMU"
                    nameKey="name"
                    innerRadius={0}
                    outerRadius={110}
                    paddingAngle={3}
                    onClick={handleRegionSelect}
                  >
                    {regionalSummary.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                        stroke={selectedRegionName === entry.name ? "#0F172A" : "#FFFFFF"}
                        strokeWidth={selectedRegionName === entry.name ? 3 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Block 2: Operational Target Metrics Overview Panel */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">🎯 Selected Regional Status Matrix</h2>
              <p className="text-[11px] text-gray-400 mb-4">Detailed power output tracking evaluation framework parameters.</p>
            </div>
            <div className="h-64 flex flex-col justify-between bg-slate-50 rounded-xl border border-slate-100 p-5">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">
                  Active Filter Focus
                </span>
                <p className="text-3xl font-black text-slate-800 mt-2">{activeData?.name} Region</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-gray-400">Monitored Capacity footprint</p>
                  <p className="text-lg font-bold text-slate-700">{activeData?.monitoredCapacityMW.toLocaleString()} MW</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Operational Target deviation</p>
                  <p className={`text-lg font-bold ${(activeData?.deviationMU ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {activeData?.deviationMU ? (activeData.deviationMU >= 0 ? `+${activeData.deviationMU}` : activeData.deviationMU) : "0"} MU
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 flex justify-between items-center">
                <span>Programmed Plan: <strong>{activeData?.todaysProgramMU} MU</strong></span>
                <span>Actual Dispatch: <strong>{activeData?.todaysActualMU} MU</strong></span>
              </div>
            </div>
          </div>

          {/* Block 3: State Level Capacity Outage Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                📍 Sub-Entity State Fleet Metrics ({selectedRegionName})
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Real-time daily target output compared against capacity forced under outages.</p>
            </div>
            <div className="h-64">
              {currentStatesData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 bg-slate-50/50 rounded-xl border border-dashed">
                  Detailed sub-station breakout metrics loaded dynamically for Northern/Western samples.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentStatesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="todaysActualMU" fill="#005BAC" name="Actual Generation (MU)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="capacityUnderOutageMW" fill="#EF4444" name="Outage Deficit (MW)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Block 4: Hourly Load Execution Path Line Graph */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                📈 Daily Intraday Generation Cycle Path ({selectedRegionName})
              </h2>
              <p className="text-[11px] text-gray-400 mb-4">Tracks today's structured programmatic schedule against actual energy output variants.</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentHourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} unit=" MU" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="programMU" stroke="#64748B" strokeDasharray="5 5" strokeWidth={2} name="Programmed Schedule Blueprint" />
                  <Line type="monotone" dataKey="actualMU" stroke="#10B981" strokeWidth={3} activeDot={{ r: 6 }} name="Actual Dispatched Telemetry" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}