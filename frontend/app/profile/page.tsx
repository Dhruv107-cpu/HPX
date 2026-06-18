"use client";

import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/utils/auth";

export default function ProfilePage() {
  const user = getCurrentUser();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-xl shadow-md p-8">

          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
              {user?.name?.charAt(0)}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {user?.name}
              </h1>

              <p className="text-gray-500">
                {user?.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="text-gray-500">
                Full Name
              </label>

              <p className="font-semibold mt-1">
                {user?.name}
              </p>
            </div>

            <div>
              <label className="text-gray-500">
                Email
              </label>

              <p className="font-semibold mt-1">
                admin@hpx.com
              </p>
            </div>

            <div>
              <label className="text-gray-500">
                Role
              </label>

              <p className="font-semibold mt-1">
                {user?.role}
              </p>
            </div>

            <div>
              <label className="text-gray-500">
                Last Login
              </label>

              <p className="font-semibold mt-1">
                Today
              </p>
            </div>

          </div>

          <div className="flex gap-4 mt-8">

            <button className="bg-[#005BAC] text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              Edit Profile
            </button>

            <button className="border px-5 py-2 rounded-lg hover:bg-gray-100">
              Change Password
            </button>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}