"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    const res = await fetch(
      `https://fastapi-order-management-system-3.onrender.com/login?username=${username}&password=${password}`,
      {
        method: "POST",
      }
    );

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-xl shadow-lg w-96">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Login
      </h1>

      
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full border border-gray-400 rounded-lg p-3 mb-4 text-black bg-white"
     />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full border border-gray-400 rounded-lg p-3 mb-6 text-black bg-white"
     />

      <button
        onClick={login}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
      >
        Sign In
      </button>
    </div>
  </div>
);
}