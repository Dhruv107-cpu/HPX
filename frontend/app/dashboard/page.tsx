import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardData } from "@/data/mockDashboard";

export default function DashboardPage() {
  return (
    <AppLayout>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Overview of trading performance and activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

        <StatCard
          title="Total Trades"
          value={dashboardData.totalTrades}
          icon="📊"
        />

        <StatCard
          title="Total Profit"
          value={dashboardData.totalProfit}
          icon="💰"
        />

        <StatCard
          title="Total Loss"
          value={dashboardData.totalLoss}
          icon="📉"
        />

        <StatCard
          title="Active Users"
          value={dashboardData.activeUsers}
          icon="👥"
        />

        <StatCard
          title="Datasets Uploaded"
          value={dashboardData.datasetsUploaded}
          icon="📁"
        />

      </div>

      {/* Recent Activity Section */}

      <div className="bg-white rounded-xl shadow-md p-6 mt-8">

        <h2 className="text-xl font-semibold mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-gray-600">

          <li>
            ✅ New dataset uploaded
          </li>

          <li>
            ✅ Analytics report generated
          </li>

          <li>
            ✅ User account created
          </li>

          <li>
            ✅ Dashboard statistics updated
          </li>

        </ul>

      </div>

    </AppLayout>
  );
}