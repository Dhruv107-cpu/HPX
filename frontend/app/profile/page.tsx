"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/services/authService";
import type { ApiUser } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const displayName = user?.email_id?.split("@")[0] ?? "";

  if (loading) {
    return (
      <AppLayout>
        <p className="text-center text-gray-500">Loading profile...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="text-gray-500">{user?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-500">Email</label>
              <p className="font-semibold mt-1">{user?.email_id}</p>
            </div>

            <div>
              <label className="text-gray-500">Role</label>
              <p className="font-semibold mt-1">{user?.role}</p>
            </div>

            <div>
              <label className="text-gray-500">Status</label>
              <p className="font-semibold mt-1">
                {user?.is_active ? "Active" : "Inactive"}
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
