"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { loginUser } from "@/services/authService";
import { setAccessToken } from "@/utils/auth";

function getLoginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Login failed. Please try again.";
  }

  if (!error.response) {
    return "Cannot reach the backend. Start it on http://localhost:8000 and try again.";
  }

  if (error.response.status === 401) {
    return "Invalid email or password. Use admin@hpx.com / Admin@123";
  }

  if (error.response.status >= 500) {
    return "Backend server error during login (not wrong credentials). Check backend logs.";
  }

  const detail = error.response.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }

  return "Login failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(
        email.trim(),
        password.trim()
      );

      setAccessToken(response.access_token);
      router.push("/dashboard");
    } catch (error) {
      setError(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/hpx-logo.png"
            alt="HPX Logo"
            width={100}
            height={50}
            className="mb-4"
          />

          <h1 className="text-2xl font-bold text-[#005BAC]">
            HPX Trade Analytics
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="admin@hpx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Admin@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#005BAC]"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005BAC] text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
