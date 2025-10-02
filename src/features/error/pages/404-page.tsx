import { Link } from "react-router";
import { FaGavel } from "react-icons/fa";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="text-center"
      >
        {/* Animated Auction Hammer Icon */}
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-100 shadow-lg">
          <FaGavel className="h-14 w-14 text-red-600 animate-bounce" />
        </div>

        {/* 404 Text */}
        <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-gray-900">
          404
        </h1>

        {/* Page not found message */}
        <p className="mt-2 text-lg font-medium text-gray-700">Page Not Found</p>
        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
          The auction you’re looking for might have ended or doesn’t exist.
        </p>

        {/* Navigation Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow-md transition hover:bg-blue-700 hover:scale-105"
          >
            Back to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 shadow-sm transition hover:bg-gray-100 hover:scale-105"
          >
            Reload Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
