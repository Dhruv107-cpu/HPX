"use client";

import { StatePreview } from "@/types/statePreview";

interface StateTooltipProps {
  data: StatePreview | null;
  visible: boolean;
  x: number;
  y: number;
}

export default function StateTooltip({
  data,
  visible,
  x,
  y,
}: StateTooltipProps) {
  if (!visible || !data) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 pointer-events-none"
      style={{
        left: x + 15,
        top: y + 15,
      }}
    >
      <h3 className="text-lg font-bold text-[#0B1A2E] mb-3">
        {data.state_name}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>⚡ Scheduled Generation</span>
          <span className="font-semibold">
            {data.scheduled_generation.toLocaleString()} MW
          </span>
        </div>

        <div className="flex justify-between">
          <span>🏭 Stations</span>
          <span className="font-semibold">
            {data.total_stations}
          </span>
        </div>

        <div className="flex justify-between">
          <span>🌱 Renewable</span>
          <span className="font-semibold">
            {data.renewable_stations}
          </span>
        </div>

        <div className="flex justify-between">
          <span>🔥 Thermal</span>
          <span className="font-semibold">
            {data.thermal_stations}
          </span>
        </div>
      </div>
    </div>
  );
}