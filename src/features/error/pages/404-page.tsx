import { Link } from "react-router";
import { FaGavel, FaHome, FaRedo } from "react-icons/fa";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="text-center max-w-md"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
          <FaGavel className="h-12 w-12 text-amber-500" />
        </div>

        <h1 className="mt-8 text-7xl font-bold text-white">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-white">Page Not Found</h2>
        <p className="mt-2 text-slate-400">
          The auction you are looking for might have ended or does not exist.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-slate-950 font-bold transition-all hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-amber-500/20"
          >
            <FaHome className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 text-white font-semibold transition-all hover:bg-slate-700 active:scale-[0.98]"
          >
            <FaRedo className="h-4 w-4" />
            Reload Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
