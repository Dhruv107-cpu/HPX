"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
try {
setLoading(true);
setError("");

```
  const response = await loginUser(
    email.trim(),
    password.trim()
  );

  localStorage.setItem(
    "access_token",
    response.access_token
  );

  router.push("/dashboard");
} catch (error) {
  setError("Invalid email or password");
} finally {
  setLoading(false);
}
```

};

return ( <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center"> <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">

```
    <div className="flex flex-col items-center mb-6">

      <img
        src="/hpx-logo.png"
        alt="HPX"
        className="h-16 mb-4"
      />

      <h1 className="text-2xl font-bold">
        Trade Analytics Dashboard
      </h1>

      <p className="text-gray-500 text-sm mt-2">
        Sign in to continue
      </p>

    </div>

    {error && (
      <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
        {error}
      </div>
    )}

    <div className="space-y-4">

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        className="w-full border rounded-lg p-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        className="w-full border rounded-lg p-3"
      />

      <div className="text-right">
        <button
          className="text-blue-600 text-sm"
          onClick={() =>
            alert(
              "Please contact administrator to reset password."
            )
          }
        >
          Forgot Password?
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg disabled:opacity-50"
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>

    </div>
  </div>
</div>
```

);
}
