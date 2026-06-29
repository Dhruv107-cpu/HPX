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

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex">

      <Sidebar
        open={sidebarOpen}
      />

      <div
        className={`flex flex-col min-h-screen flex-1 transition-all duration-300`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>

        <footer className="bg-white border-t text-center py-3 text-gray-500 text-sm">
          © 2026 HPX Trade Analytics Dashboard
        </footer>
      </div>

    </div>
  );
}