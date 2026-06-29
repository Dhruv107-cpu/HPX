"use client";

import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";

import ProfitChart from "@/components/analytics/ProfitChart";
import StrategyTable from "@/components/analytics/StrategyTable";

import {
  pnlData,
  monthlyProfit,
  strategyData,
} from "@/data/mockAnalytics";

export default function AnalyticsPage() {
  return (
    <AppLayout>
      {/* Width layout updated to max-w-[96%] with p-2 to keep side margins less and equal to upper margins */}
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor trading performance and strategy insights
          </p>
        </div>

        {/* Statistical Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Net Profit */}
          {/* FIXED: Added cursor-pointer directly to the wrapper card element so the whole icon/card area responds nicely */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Net Profit"
              value={pnlData.netProfit}
              icon="💰" 
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Net earnings after deducting fees and trading costs.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 2: Win Rate */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Win Rate"
              value={`${pnlData.winRate}%`}
              icon="🎯"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              The percentage of successfully profitable executed trades.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 3: Total Profit */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Total Profit"
              value={pnlData.totalProfit}
              icon="📈"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Gross positive accumulation from all winning strategies.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 4: Total Loss */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Total Loss"
              value={pnlData.totalLoss}
              icon="📉"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Gross negative drawdown calculated from underperforming assets.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Monthly Profit Trend
          </h2>
          <ProfitChart data={monthlyProfit} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Strategy Performance
          </h2>
          <StrategyTable data={strategyData} />
        </div>
      </div>
    </AppLayout>
  );
}