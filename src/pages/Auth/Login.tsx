import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login with:", { email, password });
    // TODO: API login logic
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
      <div className="w-full max-w-md rounded-2xl bg-gray-800/80 p-8 shadow-2xl backdrop-blur-md">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          Project Lelang
        </h2>
        <h4 className="mb-6 text-center text-xl font-bold text-white">Login</h4>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50"
              required
            />
          </div>

          {/* Forgot + Register */}
          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-indigo-400 hover:underline">
              Forgot password?
            </a>
            <a href="#" className="text-indigo-400 hover:underline">
              Register
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
