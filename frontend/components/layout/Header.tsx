"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/utils/auth";

import Image from "next/image";
import Link from "next/link";
import { clearAuth } from "@/utils/auth";

import {
  FaBell,
  FaUserCircle,
  FaBars,
} from "react-icons/fa";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
}: HeaderProps) {
  const [user, setUser] = useState<{
    email_id?: string;
    name?: string;
    role?: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <header className="h-20 bg-[#005BAC] text-white flex items-center justify-between px-6 shadow-md">

      {/* Left Side */}
      <div className="flex items-center gap-4">

        {/* MODIFIED: Added wrapper with relative group for Sidebar Toggle Tooltip */}
        <div className="relative group">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-blue-700 hover:bg-blue-800 p-3 rounded-lg transition cursor-pointer"
          >
            <FaBars size={18} />
          </button>
          {/* Tooltip Display Box */}
          <div className="absolute bottom-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-50">
            {sidebarOpen ? "Collapse sidebar menu" : "Expand sidebar menu"}
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        </div>

        <Image
          src="/hpx-logo.png"
          alt="HPX Logo"
          width={80}
          height={40}
        />

        <div>
          <h1 className="font-bold text-2xl">
            Trade Analytics Dashboard
          </h1>

          <p className="text-sm text-blue-100">
            HPX Internal Portal
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        {/* MODIFIED: Added relative group & cursor-pointer for Notifications Tooltip */}
        <div className="relative group">
          <button className="text-xl hover:scale-110 transition cursor-pointer">
            <FaBell />
          </button>

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 pointer-events-none">
            3
          </span>
          {/* Tooltip Display Box */}
          <div className="absolute bottom-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-50">
            View recent system notifications.
            <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative">
          {/* MODIFIED: Wrapped dropdown trigger in a group to show the User Profile Tooltip only when dropdown is closed */}
          <div className="relative group">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer text-left"
            >
              <FaUserCircle size={30} />

              <div>
                <p className="font-medium">
                  {user?.email_id || user?.name || "User"}
                </p>

                <p className="text-xs text-blue-100">
                  {user?.role}
                </p>
              </div>
            </button>
            {/* Tooltip Display Box (hidden if menu open to avoid clutter) */}
            {!open && (
              <div className="absolute bottom-[-45px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-50">
                Account settings and session control.
                <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
            )}
          </div>

          {open && (
            <div className="absolute right-0 mt-3 bg-white text-black rounded-xl shadow-xl w-52 z-50 overflow-hidden">

              {/* MODIFIED: Profile Dropdown Item with internal group tooltip */}
              <div className="relative group">
                <Link
                  href="/profile"
                  className="block px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  👤 View Profile
                </Link>
                <div className="absolute left-[-165px] top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-50">
                  Manage user profile details.
                  <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>

              {/* MODIFIED: Settings Dropdown Item with internal group tooltip */}
              <div className="relative group">
                <Link
                  href="/settings"
                  className="block px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  ⚙️ Settings
                </Link>
                <div className="absolute left-[-165px] top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-50">
                  Configure internal preferences.
                  <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* MODIFIED: Logout Dropdown Button with internal group tooltip */}
              <div className="relative group">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer"
                >
                  🚪 Logout
                </button>
                <div className="absolute left-[-165px] top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md whitespace-nowrap z-50">
                  Terminate session cleanly.
                  <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}