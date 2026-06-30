"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import Header from "./Header";

import { isAuthenticated } from "@/utils/auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    // MODIFIED: Added h-screen, w-screen, and overflow-hidden to break layout stretching constraints
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">

      <Sidebar open={sidebarOpen} />

      {/* MODIFIED: Handled layout structural columns using clean viewport dimension limits */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
        
        {/* Header now spans perfectly across 100% of the active flex area */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* MODIFIED: main container now handles internal screen scrolling independently */}
        <main className="flex-1 w-full overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
          {children}
        </main>

        <footer className="bg-white border-t text-center py-3 text-gray-500 text-sm w-full">
          © 2026 HPX Trade Analytics Dashboard
        </footer>
      </div>

    </div>
  );
}