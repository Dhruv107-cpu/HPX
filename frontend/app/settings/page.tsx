"use client";

import AppLayout from "@/components/layout/AppLayout";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="bg-white p-8 rounded-xl shadow-md">

        <h1 className="text-3xl font-bold mb-6">
          Settings
        </h1>

        <div className="space-y-4">

          <div>
            <label className="font-medium">
              Theme
            </label>

            <select className="border rounded-lg p-2 ml-4">
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>

          <div>
            <label className="font-medium">
              Notifications
            </label>

            <input
              type="checkbox"
              className="ml-4"
              defaultChecked
            />
          </div>

        </div>

      </div>
    </AppLayout>
  );
}