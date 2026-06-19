"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="flex flex-col min-h-screen ml-0 md:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
        <footer className="bg-white border-t text-center py-3 text-gray-500 text-sm">
          © 2026 HPX Trade Analytics Dashboard
        </footer>
      </div>
    </div>
  );
}
