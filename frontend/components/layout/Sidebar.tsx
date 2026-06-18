"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  FaChartBar,
  FaUsers,
  FaUpload,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaChartBar />,
      href: "/dashboard",
    },
    {
      name: "Analytics",
      icon: <FaChartBar />,
      href: "/analytics",
    },
    {
      name: "Users",
      icon: <FaUsers />,
      href: "/users",
    },
    {
      name: "Upload",
      icon: <FaUpload />,
      href: "/upload",
    },
    {
      name: "Profile",
      icon: <FaUser />,
      href: "/profile",
    },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-[#005BAC] text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 overflow-hidden shadow-xl ${
          open ? "w-64" : "w-0"
        }`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-slate-700 mt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#4DA3FF]">
              HPX
            </h1>

            <p className="text-xs text-slate-400">
              Trade Analytics
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-2">

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                pathname === item.href
                  ? "bg-[#005BAC] text-white"
                  : "hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </Link>
          ))}

        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-500">
          HPX Dashboard v1.0
        </div>
      </aside>
    </>
  );
}