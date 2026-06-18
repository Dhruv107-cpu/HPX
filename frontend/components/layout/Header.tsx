"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/utils/auth";
import Image from "next/image";
import Link from "next/link";

import {
  FaBell,
  FaUserCircle,
  FaMoon,
  FaSun,
} from "react-icons/fa";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <header className="h-16 bg-[#005BAC] text-white flex items-center justify-between px-6 shadow-lg">

      {/* Left Section */}
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

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {/* Dark Mode Button */}
        <button
          onClick={() =>
            setDarkMode(!darkMode)
          }
          className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition"
        >
          {darkMode ? (
            <FaSun />
          ) : (
            <FaMoon />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">

          <button className="text-xl hover:scale-110 transition">
            <FaBell />
          </button>

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
            3
          </span>

        </div>

        {/* Profile */}
        <div className="relative">

          <button
            onClick={() =>
              setOpen(!open)
            }
            className="flex items-center gap-3"
          >
            <div className="bg-white text-[#005BAC] w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>

            <div className="text-left hidden md:block">
              <p className="font-medium">
                {user?.name}
              </p>

              <p className="text-xs text-blue-100">
                {user?.role}
              </p>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 bg-white text-black rounded-xl shadow-xl w-56 z-50 overflow-hidden">

              <div className="px-4 py-3 bg-gray-50 border-b">
                <p className="font-semibold">
                  {user?.name}
                </p>

                <p className="text-sm text-gray-500">
                  {user?.role}
                </p>
              </div>

              <Link
                href="/profile"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                👤 View Profile
              </Link>

              <Link
                href="/settings"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                ⚙️ Settings
              </Link>

              <hr />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
              >
                🚪 Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}