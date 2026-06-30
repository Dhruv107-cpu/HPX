"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  FaChartBar,
  FaUsers,
  FaUpload,
  FaRegFileAlt,
  FaUser,
  FaRegChartBar,
} from "react-icons/fa";

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({
  open,
}: SidebarProps) {
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
    { name: "Files", 
       icon: <FaRegFileAlt size={18} />,
       href: "/files",
        tooltip: "Access and organize repository documents" 
      },
      { name: "Installed Capacity", 
        icon: <FaChartBar />,
         href: "/installed-capacity" },

         { name: "Daily Generation",
           icon: <FaRegChartBar />,
           href: "/daily-generation",  
          },
     {
      name: "Profile",
      icon: <FaUser />,
      href: "/profile",
    },
  ];

  return (
    <aside
      /* MODIFIED: Changed h-screen to min-h-screen to stretch perfectly to the bottom of the page container */
      /* MODIFIED: Changed bg-slate-900 to bg-[#0B1A2E] to match the deep midnight navy tone in your screenshot */
      className={`text-white min-h-screen bg-[#0B1A2E] transition-all duration-300 overflow-hidden shadow-xl sticky top-0 flex flex-col justify-between ${
        open ? "w-64" : "w-0"
      }`}
    >
      {open && (
        <>
          {/* Top Wrapper for Logo and Nav */}
          <div className="flex flex-col flex-1">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center border-b border-slate-700/50">
              <div className="text-center">
                <Image
                          src="/hpx-logo.png"
                          alt="HPX Logo"
                          width={100}
                          height={50}
                        />
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
                  /* MODIFIED: Added cursor-pointer to guarantee the hand pointer icon appears */
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    pathname === item.href
                      ? "bg-[#005BAC] text-white font-medium"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <span className="text-lg">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer */}
          {/* MODIFIED: Switched from absolute positioning to flex layout to keep it clean and naturally positioned at the bottom */}
          <div className="w-full text-center pb-6 pt-4 text-xs text-slate-500 border-t border-slate-800/30">
            HPX Dashboard v1.0
          </div>
        </>
      )}
    </aside>
  );
}