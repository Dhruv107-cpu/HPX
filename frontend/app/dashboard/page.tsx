"use client";

import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardData } from "@/data/mockDashboard";

export default function DashboardPage() {
  return (
    <AppLayout>
      {/* MODIFIED: Implemented max-w-[96%] wrapper and padding to balance layout margins safely */}
      <div className="max-w-[96%] mx-auto max-h-[calc(100vh-120px)] overflow-y-auto p-2">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Overview of trading performance and activity
          </p>
        </div>

        {/* Statistical Cards Metrics Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

          {/* Card 1: Total Trades */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Total Trades"
              value={dashboardData.totalTrades}
              icon="📊"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              The total count of all buy and sell records processed.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 2: Total Profit */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Total Profit"
              value={dashboardData.totalProfit}
              icon="💰"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Gross dynamic profit captured across active trade routes.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 3: Total Loss */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Total Loss"
              value={dashboardData.totalLoss}
              icon="📉"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Gross financial drawdown values accumulated on asset pairings.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 4: Active Users */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Active Users"
              value={dashboardData.activeUsers}
              icon="👥"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Number of accounts interactively trading right now.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

          {/* Card 5: Datasets Uploaded */}
          <div className="relative group cursor-pointer">
            <StatCard
              title="Datasets Uploaded"
              value={dashboardData.datasetsUploaded}
              icon="📁"
            />
            {/* Info Display Box (Tooltip) */}
            <div className="absolute top-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-10">
              Total historical data files linked for algorithmic evaluation.
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>

        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Recent Activity
          </h2>

          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <span>✅</span> New dataset uploaded
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> Analytics report generated
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> User account created
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span> Dashboard statistics updated
            </li>
          </ul>
        </div>

      </div>
    </AppLayout>
  );
}