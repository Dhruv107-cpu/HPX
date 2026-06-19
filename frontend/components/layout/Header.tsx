"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/authService";
import { clearAuth } from "@/utils/auth";
import type { ApiUser } from "@/types/user";
import Image from "next/image";
import Link from "next/link";

import {
  FaBell,
  FaMoon,
  FaSun,
} from "react-icons/fa";

export default function Header() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const displayName = user?.email_id?.split("@")[0] ?? "User";

  return (
    <header className="h-16 bg-[#005BAC] text-white flex items-center justify-between px-6 shadow-lg">

      <div className="flex items-center gap-4">
        <Image
          src="/hpx-logo.png"
          alt="HPX Logo"
          width={80}
          height={40}
        />

        <div>
          <h1 className="font-bold text-lg">
            Trade Analytics Dashboard
          </h1>

          <p className="text-xs text-blue-100">
            HPX Internal Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <div className="relative">
          <button className="text-xl hover:scale-110 transition">
            <FaBell />
          </button>

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
            3
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3"
          >
            <div className="bg-white text-[#005BAC] w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="text-left hidden md:block">
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-blue-100">{user?.role}</p>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 bg-white text-black rounded-xl shadow-xl w-56 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>

              <Link
                href="/profile"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                View Profile
              </Link>

              <Link
                href="/settings"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Settings
              </Link>

              <hr />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
