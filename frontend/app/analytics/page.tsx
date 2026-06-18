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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Analytics Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor trading performance and strategy insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Net Profit"
          value={pnlData.netProfit}
          icon="💰"
        />

        <StatCard
          title="Win Rate"
          value={`${pnlData.winRate}%`}
          icon="🎯"
        />

        <StatCard
          title="Total Profit"
          value={pnlData.totalProfit}
          icon="📈"
        />

        <StatCard
          title="Total Loss"
          value={pnlData.totalLoss}
          icon="📉"
        />
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
    </AppLayout>
  );
}